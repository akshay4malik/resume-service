import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { downloadFromR2 } from "@/lib/r2";
import { extractText } from "unpdf";
import { deductCredits, CREDIT_COSTS } from "@/lib/credits";
import { generateCompletion } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60; // 60s per batch execution

const BATCH_SIZE = 5;

/**
 * POST /api/ranking/process-batch
 * Body: { projectId?: string }
 *
 * 1. Finds up to BATCH_SIZE (5) files in 'PENDING' status for this user (and projectId if provided).
 * 2. Atomically marks them as 'PROCESSING'.
 * 3. Downloads file buffer from Cloudflare R2.
 * 4. Extracts text using unpdf.
 * 5. Uses Gemini 2.0 Flash to score against the project's Job Description (scale 0-100 + reasoning).
 * 6. Updates rb_files record to 'COMPLETED' with result_data, or 'FAILED' with error_message.
 * 7. Returns status summary and number of remaining pending files.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let projectId: string | null = null;
    try {
      const body = await req.json();
      if (body?.projectId) projectId = body.projectId;
    } catch {
      // Body may be empty
    }

    // Query for PENDING files
    let query = supabase
      .from("rb_files")
      .select("id, project_id, file_name, r2_key, created_at")
      .eq("user_id", user.id)
      .eq("file_type", "RESUME")
      .eq("status", "PENDING")
      .eq("deleted", false)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data: pendingFiles, error: fetchError } = await query;

    if (fetchError) {
      console.error("[ranking/process-batch] Error fetching pending files:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!pendingFiles || pendingFiles.length === 0) {
      return NextResponse.json({
        processed: 0,
        remaining_pending: 0,
        message: "No pending files found to process.",
      });
    }

    // Atomically lock files FIRST so concurrent workers never double-charge credits
    const lockedFiles: typeof pendingFiles = [];
    const nowIso = new Date().toISOString();

    for (const file of pendingFiles) {
      const { data: lockedFile, error: lockError } = await supabase
        .from("rb_files")
        .update({
          status: "PROCESSING",
          processing_started_at: nowIso,
        })
        .eq("id", file.id)
        .eq("status", "PENDING")
        .select("id")
        .maybeSingle();

      if (!lockError && lockedFile) {
        lockedFiles.push(file);
      }
    }

    if (lockedFiles.length === 0) {
      return NextResponse.json({
        processed: 0,
        remaining_pending: 0,
        message: "Files already picked up by another worker.",
      });
    }

    // Deduct credits ONLY for the files this worker actually locked (2 credits per resume)
    const requiredCredits = lockedFiles.length * CREDIT_COSTS.RESUME_RANKING_PER_FILE;
    const deduction = await deductCredits(supabase, {
      userId: user.id,
      amount: requiredCredits,
      description: `Batch ranking of ${lockedFiles.length} candidate resumes`,
      serviceType: "RESUME_RANKING",
      details: { count: lockedFiles.length, projectId },
    });

    if (!deduction.success) {
      // Revert locked files back to PENDING if user lacks credits
      await supabase
        .from("rb_files")
        .update({ status: "PENDING", processing_started_at: null })
        .in("id", lockedFiles.map((f) => f.id))
        .eq("status", "PROCESSING");

      return NextResponse.json(
        { error: deduction.error || `Insufficient credits. Need ${requiredCredits} credits (2 per resume).` },
        { status: 402 }
      );
    }

    const processedResults = [];

    // Process only the files locked by this worker
    for (const file of lockedFiles) {
      try {
        // Fetch project to get job description
        const { data: project, error: projectError } = await supabase
          .from("rb_projects")
          .select("id, description")
          .eq("id", file.project_id)
          .single();

        if (projectError || !project || !project.description) {
          throw new Error("Associated project or Job Description not found");
        }

        const jobDescription = project.description;

        // Download from R2
        const fileBuffer = await downloadFromR2(file.r2_key);

        // Extract text using unpdf
        const uint8Array = new Uint8Array(fileBuffer);
        const { text } = await extractText(uint8Array, { mergePages: true });
        const resumeText = Array.isArray(text) ? text.join("\n") : (text ?? "");

        if (!resumeText.trim()) {
          throw new Error("Could not extract any text from resume PDF");
        }

        // Call Gemini with the 1:1 original prompt from file_processor.py
        const prompt = `Given the following job description, score the resume on a scale of 0-100 and provide a short reasoning.
Job Description:
${jobDescription}

Resume:
${resumeText}

Respond as a JSON object: {"score": int, "reasoning": string}`;

        const responseText = await generateCompletion({
          systemPrompt: "You are an expert resume reviewer.",
          userPrompt: prompt,
          temperature: 0.2,
          responseFormatJson: true,
        });

        const parsedResult = JSON.parse(responseText);

        const score = typeof parsedResult.score === "number" ? parsedResult.score : parseInt(parsedResult.score, 10) || 0;
        const reasoning = parsedResult.reasoning || "";

        const resultData = {
          score,
          reasoning,
          resume_content: resumeText.slice(0, 500),
        };

        // Mark as COMPLETED
        await supabase
          .from("rb_files")
          .update({
            status: "COMPLETED",
            result_data: resultData,
            error_message: null,
          })
          .eq("id", file.id);

        processedResults.push({ file_id: file.id, status: "COMPLETED", score });
      } catch (procErr: any) {
        console.error(`[ranking/process-batch] Error processing file ${file.id}:`, procErr);
        // Mark as FAILED
        await supabase
          .from("rb_files")
          .update({
            status: "FAILED",
            error_message: procErr?.message || "Processing failed",
          })
          .eq("id", file.id);

        processedResults.push({ file_id: file.id, status: "FAILED", error: procErr?.message });
      }
    }

    // Count remaining pending files
    let remainingQuery = supabase
      .from("rb_files")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("file_type", "RESUME")
      .eq("status", "PENDING")
      .eq("deleted", false);

    if (projectId) {
      remainingQuery = remainingQuery.eq("project_id", projectId);
    }

    const { count: remainingCount } = await remainingQuery;

    return NextResponse.json({
      processed: processedResults.length,
      results: processedResults,
      remaining_pending: remainingCount || 0,
    });
  } catch (error: any) {
    console.error("[ranking/process-batch] Error in route:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2, getResumeRankingKey } from "@/lib/r2";

export const runtime = "nodejs";
export const maxDuration = 60; // 60s for batch upload

/**
 * POST /api/ranking/upload
 * Accepts multipart/form-data with:
 * - project_id (UUID)
 * - files (multiple File objects, typically PDFs)
 * 
 * Stores each file in Cloudflare R2 and creates a record in `rb_files`
 * with status = 'PENDING'.
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

    const formData = await req.formData();
    const projectId = formData.get("project_id") as string;
    const uploadedFiles = formData.getAll("files") as File[];

    if (!projectId) {
      return NextResponse.json(
        { error: "project_id is required" },
        { status: 400 }
      );
    }

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from("rb_projects")
      .select("id, project_name, description")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .eq("deleted", false)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    const fileIds: string[] = [];

    for (const file of uploadedFiles) {
      if (typeof file === "string" || !file.name) continue;

      const fileId = crypto.randomUUID();
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const r2Key = getResumeRankingKey(user.id, projectId, fileId);

      // Upload to R2
      await uploadToR2(r2Key, buffer, file.type || "application/pdf");

      // Insert record into rb_files with PENDING status
      const { data: dbFile, error: fileInsertError } = await supabase
        .from("rb_files")
        .insert({
          id: fileId,
          user_id: user.id,
          project_id: projectId,
          file_name: file.name,
          file_type: "RESUME",
          r2_key: r2Key,
          file_size: file.size,
          content_type: file.type || "application/pdf",
          status: "PENDING",
          metadata: {},
        })
        .select("id")
        .single();

      if (fileInsertError) {
        console.error("[ranking/upload] Failed to insert file row:", fileInsertError);
      } else if (dbFile) {
        fileIds.push(dbFile.id);
      }
    }

    return NextResponse.json({
      project_id: project.id,
      job_id: project.id,
      project_name: project.project_name,
      file_ids: fileIds,
      status: "pending",
      message: `Uploaded ${fileIds.length} resume(s) for ranking. Ready for processing.`,
      total_files: fileIds.length,
      poll_url: `/api/ranking/status/${project.id}`,
    });
  } catch (error: any) {
    console.error("[ranking/upload] Error uploading resumes:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload resumes" },
      { status: 500 }
    );
  }
}


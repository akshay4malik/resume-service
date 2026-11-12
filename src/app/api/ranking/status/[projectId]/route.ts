import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * GET /api/ranking/status/[projectId]
 * (Equivalent to old /api/v1/ai/job/status/{job_id})
 *
 * Returns:
 * - job_id (project id)
 * - status ("pending" | "processing" | "completed" | "completed_with_errors")
 * - stats: { total, pending, processing, completed, failed, progress_percent }
 * - files: list of candidate files with scores, rank, reasoning, and download paths
 * - project: project metadata and job description
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get project
    const { data: project, error: projectError } = await supabase
      .from("rb_projects")
      .select("id, project_name, project_type, description, created_at, updated_at")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .eq("deleted", false)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: `Job or Project ${projectId} not found` },
        { status: 404 }
      );
    }

    // Get all files for project
    const { data: files, error: filesError } = await supabase
      .from("rb_files")
      .select("id, file_name, status, r2_key, result_data, error_message, created_at, updated_at")
      .eq("project_id", projectId)
      .eq("deleted", false)
      .order("created_at", { ascending: true });

    if (filesError) {
      console.error("[ranking/status] Error fetching files:", filesError);
      return NextResponse.json({ error: filesError.message }, { status: 500 });
    }

    const filesList = files || [];
    const total = filesList.length;
    const pending = filesList.filter((f) => f.status === "PENDING").length;
    const processing = filesList.filter((f) => f.status === "PROCESSING").length;
    const completed = filesList.filter((f) => f.status === "COMPLETED").length;
    const failed = filesList.filter((f) => f.status === "FAILED").length;

    const progress_percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    let overall_status = "pending";
    if (total === 0) {
      overall_status = "pending";
    } else if (failed > 0 && completed + failed === total) {
      overall_status = "completed_with_errors";
    } else if (completed === total) {
      overall_status = "completed";
    } else if (processing > 0 || pending > 0) {
      overall_status = "processing";
    }

    // Collect file results and compute ranking
    const fileItems = filesList.map((file) => {
      const res: any = {
        file_id: file.id,
        file_name: file.file_name,
        status: file.status,
        created_at: file.created_at,
        updated_at: file.updated_at,
      };

      if (file.status === "COMPLETED") {
        res.result = file.result_data;
      } else if (file.status === "FAILED") {
        res.error = file.error_message;
      }

      return res;
    });

    // Sort completed files by score descending to assign rank
    const completedFiles = fileItems
      .filter((f) => f.status === "COMPLETED" && f.result && typeof f.result.score === "number")
      .sort((a, b) => (b.result.score || 0) - (a.result.score || 0));

    completedFiles.forEach((file, index) => {
      file.result.rank = index + 1;
      file.result.match_percentage = file.result.score;
    });

    // Order all files: completed first (ordered by score), then processing, pending, failed
    const sortedFiles = [
      ...completedFiles,
      ...fileItems.filter(
        (f) =>
          f.status !== "COMPLETED" ||
          !f.result ||
          typeof f.result.score !== "number"
      ),
    ];

    return NextResponse.json({
      job_id: projectId,
      status: overall_status,
      stats: {
        total,
        pending,
        processing,
        completed,
        failed,
        progress_percent,
      },
      files: sortedFiles,
      project: {
        id: project.id,
        name: project.project_name,
        type: project.project_type,
        description: project.description,
        job_description: project.description,
        created_at: project.created_at,
      },
    });
  } catch (error: any) {
    console.error("[ranking/status] Error in status route:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}


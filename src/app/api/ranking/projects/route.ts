import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * GET /api/ranking/projects
 * Lists all ranking projects belonging to the authenticated user,
 * along with aggregated file statistics (total, pending, processing, completed, failed).
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch projects
    const { data: projects, error: projectsError } = await supabase
      .from("rb_projects")
      .select("id, project_name, project_type, description, created_at, updated_at")
      .eq("user_id", user.id)
      .eq("project_type", "RESUME_RANKING")
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    if (projectsError) {
      console.error("[ranking/projects] Failed to fetch projects:", projectsError);
      return NextResponse.json(
        { error: projectsError.message },
        { status: 500 }
      );
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch file counts for all projects
    const projectIds = projects.map((p) => p.id);
    const { data: files, error: filesError } = await supabase
      .from("rb_files")
      .select("id, project_id, status")
      .in("project_id", projectIds)
      .eq("deleted", false);

    if (filesError) {
      console.error("[ranking/projects] Failed to fetch files for stats:", filesError);
    }

    const filesList = files || [];

    const projectsWithStats = projects.map((project) => {
      const pFiles = filesList.filter((f) => f.project_id === project.id);
      const total = pFiles.length;
      const completed = pFiles.filter((f) => f.status === "COMPLETED").length;
      const processing = pFiles.filter((f) => f.status === "PROCESSING").length;
      const pending = pFiles.filter((f) => f.status === "PENDING").length;
      const failed = pFiles.filter((f) => f.status === "FAILED").length;

      return {
        id: project.id,
        project_name: project.project_name,
        name: project.project_name,
        description: project.description || "",
        job_description: project.description || "",
        created_at: project.created_at,
        updated_at: project.updated_at,
        file_stats: {
          total_files: total,
          completed_files: completed,
          processing_files: processing,
          pending_files: pending,
          failed_files: failed,
        },
      };
    });

    return NextResponse.json(projectsWithStats);
  } catch (error: any) {
    console.error("[ranking/projects] Error in GET handler:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ranking/projects
 * Creates a new Resume Ranking project with a job description.
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

    const body = await req.json();
    const { project_name, description, job_description } = body;
    const jd = job_description || description;

    if (!project_name || typeof project_name !== "string" || !project_name.trim()) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    if (!jd || typeof jd !== "string" || !jd.trim()) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    const { data: project, error: insertError } = await supabase
      .from("rb_projects")
      .insert({
        user_id: user.id,
        project_name: project_name.trim(),
        project_type: "RESUME_RANKING",
        description: jd.trim(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("[ranking/projects] Failed to insert project:", insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: project.id,
      project_name: project.project_name,
      description: project.description,
      job_description: project.description,
      created_at: project.created_at,
      total_files: 0,
      completed_files: 0,
      pending_files: 0,
      failed_files: 0,
    });
  } catch (error: any) {
    console.error("[ranking/projects] Error in POST handler:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPresignedDownloadUrl } from "@/lib/r2";

export const runtime = "nodejs";

/**
 * GET /api/ranking/files/[fileId]/download
 * Returns a presigned download URL for the original candidate resume stored in Cloudflare R2.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: file, error: fileError } = await supabase
      .from("rb_files")
      .select("id, r2_key, file_name")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const downloadUrl = await getPresignedDownloadUrl(file.r2_key, 3600);

    return NextResponse.json({
      download_url: downloadUrl,
      file_name: file.file_name,
    });
  } catch (error: any) {
    console.error("[ranking/files/download] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate download url" },
      { status: 500 }
    );
  }
}


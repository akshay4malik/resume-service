/**
 * @file r2.ts
 * @description Cloudflare R2 storage utility — replaces Azure Blob Storage.
 *
 * Uses the AWS SDK v3 S3-compatible client because R2 exposes an S3-compatible API.
 *
 * R2 key conventions (mirrors old Azure blob paths):
 *   resume_builder_upload/{userId}/resumes/{fileId}.pdf   — uploaded resume PDFs (7-day lifecycle)
 *   resume_ranking/{userId}/{projectId}/{fileId}.pdf       — ranking batch uploads
 *   invoice/{userId}/{projectId}/{fileId}.pdf              — invoice uploads
 *   cover_letter/{userId}/{fileId}.pdf                     — generated cover letters
 *
 * Required environment variables:
 *   R2_ENDPOINT          — https://{accountId}.r2.cloudflarestorage.com
 *   R2_ACCESS_KEY_ID     — R2 API token access key ID
 *   R2_SECRET_ACCESS_KEY — R2 API token secret access key
 *   R2_BUCKET_NAME       — name of the R2 bucket
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// =============================================================================
// CONFIGURATION & LAZY CLIENT
// =============================================================================

export function getR2Config() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(
      "[r2] Missing required environment variables (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME). " +
      "Add them to your .env.local (development) or Vercel project settings (production)."
    );
  }

  return { endpoint, accessKeyId, secretAccessKey, bucketName };
}

let _r2Client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!_r2Client) {
    const config = getR2Config();
    _r2Client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return _r2Client;
}

export const r2Client = new Proxy({} as S3Client, {
  get(_target, prop) {
    return (getR2Client() as any)[prop];
  },
});

export function getBucketName(): string {
  return process.env.R2_BUCKET_NAME || "";
}

// =============================================================================
// CORE OPERATIONS
// =============================================================================

/**
 * Uploads a file to Cloudflare R2.
 *
 * @param key         - R2 object key (use a helper function below to build it).
 * @param body        - File contents as a Buffer or Uint8Array.
 * @param contentType - MIME type, e.g. "application/pdf" or "image/png".
 * @returns           The R2 object key on success (same as the `key` parameter).
 *
 * @example
 * const key = getResumeUploadKey(userId, fileId);
 * await uploadToR2(key, pdfBuffer, "application/pdf");
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const input: PutObjectCommandInput = {
    Bucket: getBucketName(),
    Key: key,
    Body: body,
    ContentType: contentType,
  };

  try {
    await r2Client.send(new PutObjectCommand(input));
    return key;
  } catch (error) {
    console.error(`[r2] uploadToR2 failed for key="${key}":`, error);
    throw error;
  }
}

export async function downloadFromR2(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  try {
    const response = await r2Client.send(command);
    if (!response.Body) {
      throw new Error(`Empty body returned from R2 for key="${key}"`);
    }
    const byteArray = await response.Body.transformToByteArray();
    return Buffer.from(byteArray);
  } catch (error) {
    console.error(`[r2] downloadFromR2 failed for key="${key}":`, error);
    throw error;
  }
}

/**
 * Generates a pre-signed URL that allows a client to **download** an object
 * directly from R2 without exposing credentials.
 *
 * @param key              - R2 object key.
 * @param expiresInSeconds - URL validity window in seconds. Defaults to 3600 (1 hour).
 * @returns                A time-limited HTTPS URL for downloading the object.
 *
 * @example
 * const url = await getPresignedDownloadUrl(resume.r2_key, 1800);
 * res.redirect(url);
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  try {
    return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
  } catch (error) {
    console.error(`[r2] getPresignedDownloadUrl failed for key="${key}":`, error);
    throw error;
  }
}

/**
 * Generates a pre-signed URL that allows a **browser** to upload a file
 * directly to R2 (client-side upload) without routing through your server.
 *
 * Flow:
 *   1. Client requests a pre-signed upload URL from your API route.
 *   2. API route calls this function and returns the URL.
 *   3. Client PUTs the file directly to R2 using the returned URL.
 *   4. Client notifies your API route of completion; you save the key to the DB.
 *
 * @param key              - R2 object key the browser will write to.
 * @param contentType      - MIME type the browser will send in Content-Type header.
 * @param expiresInSeconds - URL validity window in seconds. Defaults to 300 (5 minutes).
 * @returns                A time-limited HTTPS URL for uploading directly to R2.
 *
 * @example
 * const uploadUrl = await getPresignedUploadUrl(key, "application/pdf", 300);
 * return NextResponse.json({ uploadUrl, key });
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = 300
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    ContentType: contentType,
  });

  try {
    return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
  } catch (error) {
    console.error(`[r2] getPresignedUploadUrl failed for key="${key}":`, error);
    throw error;
  }
}

/**
 * Permanently deletes an object from R2.
 *
 * Note: R2 does not throw if the object does not exist — this is idempotent.
 *
 * @param key - R2 object key to delete.
 *
 * @example
 * await deleteFromR2(file.r2_key);
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    await r2Client.send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: key }));
  } catch (error) {
    console.error(`[r2] deleteFromR2 failed for key="${key}":`, error);
    throw error;
  }
}

/**
 * Checks whether an object exists in R2 without downloading it.
 *
 * Uses HeadObject which is cheap and does not transfer the object body.
 *
 * @param key - R2 object key to probe.
 * @returns   `true` if the object exists, `false` if it does not (404 / NotFound).
 *
 * @example
 * if (!(await fileExistsInR2(key))) {
 *   throw new Error("Source file not found in R2");
 * }
 */
export async function fileExistsInR2(key: string): Promise<boolean> {
  try {
    await r2Client.send(new HeadObjectCommand({ Bucket: getBucketName(), Key: key }));
    return true;
  } catch (error: unknown) {
    // R2 / S3 signals "not found" via error name or HTTP 404
    if (
      error instanceof Error &&
      (error.name === "NotFound" ||
        error.name === "NoSuchKey" ||
        (error as NodeJS.ErrnoException).code === "NoSuchKey")
    ) {
      return false;
    }
    console.error(`[r2] fileExistsInR2 failed for key="${key}":`, error);
    throw error;
  }
}

// =============================================================================
// KEY HELPERS
// =============================================================================
// These functions produce canonical R2 object keys that mirror the old Azure
// Blob Storage path conventions. Always use these helpers — never construct
// keys ad hoc — to keep paths consistent across the codebase.

/**
 * Key for an original resume PDF uploaded via the Resume Builder.
 * Objects at this path have a 7-day R2 lifecycle policy applied.
 *
 * @example `resume_builder_upload/abc-123/resumes/def-456.pdf`
 */
export function getResumeUploadKey(userId: string, fileId: string): string {
  return `resume_builder_upload/${userId}/resumes/${fileId}.pdf`;
}

/**
 * Key for a resume PDF uploaded as part of a Resume Ranking project.
 *
 * @example `resume_ranking/abc-123/proj-789/def-456.pdf`
 */
export function getResumeRankingKey(
  userId: string,
  projectId: string,
  fileId: string
): string {
  return `resume_ranking/${userId}/${projectId}/${fileId}.pdf`;
}

/**
 * Key for an invoice PDF uploaded for parsing.
 *
 * @example `invoice/abc-123/proj-789/def-456.pdf`
 */
export function getInvoiceKey(
  userId: string,
  projectId: string,
  fileId: string
): string {
  return `invoice/${userId}/${projectId}/${fileId}.pdf`;
}

/**
 * Key for a generated cover letter PDF.
 *
 * @example `cover_letter/abc-123/def-456.pdf`
 */
export function getCoverLetterKey(userId: string, fileId: string): string {
  return `cover_letter/${userId}/${fileId}.pdf`;
}

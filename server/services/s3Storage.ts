import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";


class S3StorageService {
  private client: S3Client | null = null;
  private bucket: string = "";
  private isConfigured: boolean = false;

  initialize() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || "us-east-1";
    const bucket = process.env.AWS_S3_BUCKET;
    const endpoint = process.env.AWS_S3_ENDPOINT;

    if (!accessKeyId || !secretAccessKey || !bucket) {
      console.log("[S3Storage] Not configured - missing AWS credentials or bucket");
      this.isConfigured = false;
      return;
    }

    const config: any = {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    if (endpoint) {
      config.endpoint = endpoint;
      config.forcePathStyle = true;
    }

    this.client = new S3Client(config);
    this.bucket = bucket;
    this.isConfigured = true;
    console.log(`[S3Storage] Configured with bucket: ${bucket}, region: ${region}`);
  }

  isAvailable(): boolean {
    return this.isConfigured && this.client !== null;
  }

  async uploadFile(
    key: string,
    body: Buffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("S3 storage not configured");
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    });

    await this.client!.send(command);
    console.log(`[S3Storage] Uploaded: ${key}`);
    
    return `s3://${this.bucket}/${key}`;
  }

  async downloadFile(key: string): Promise<Buffer> {
    if (!this.isAvailable()) {
      throw new Error("S3 storage not configured");
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client!.send(command);
    
    if (!response.Body) {
      throw new Error(`File not found: ${key}`);
    }

    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    
    return Buffer.concat(chunks);
  }

  async getSignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("S3 storage not configured");
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client!, command, { expiresIn });
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("S3 storage not configured");
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client!, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("S3 storage not configured");
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client!.send(command);
    console.log(`[S3Storage] Deleted: ${key}`);
  }

  async fileExists(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client!.send(command);
      return true;
    } catch (error: any) {
      if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  getKeyFromUrl(s3Url: string): string | null {
    if (s3Url.startsWith("s3://")) {
      const parts = s3Url.replace("s3://", "").split("/");
      parts.shift();
      return parts.join("/");
    }
    return null;
  }

  generateKey(userId: number, filename: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `documents/${userId}/${timestamp}-${sanitizedFilename}`;
  }
}

export const s3Storage = new S3StorageService();

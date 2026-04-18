import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { ApiError } from "../utils/apiError";
import { r2Config } from "../config/cloudflare.config";
import { logger } from "../config/logger";

export class CloudflareService {
  private readonly s3 = new S3Client({
    region: r2Config.region,
    endpoint: r2Config.endpoint,
    credentials: r2Config.credentials,
  });
  async uploadFileS3(buffer: Buffer, key: string, mimetype: string) {
    const params = {
      Bucket: r2Config.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    try {
      await this.s3.send(new PutObjectCommand(params));

      const url = `${r2Config.R2_PUBLIC_DOMAIN}/${key}`;

      return {
        url,
        key,
      };
    } catch (error) {
      logger.error("Error in uploading image to s3", error);
      throw new ApiError("فشل رفع الملف إلى S3", 500);
    }
  }
  async deleteFileS3(key: string) {
    const params = {
      Key: key,
      Bucket: r2Config.bucket,
    };
    try {
      await this.s3.send(new DeleteObjectCommand(params));
    } catch (error) {
      logger.error("Error in deleteing file from S3", error);
      throw new ApiError("Error in deleteing file from S3", 500);
    }
  }
}

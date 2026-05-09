import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "@config/cloudinary";

export class UploadService {
  uploadProductImage(fileBuffer: Buffer): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "uniforms/products",
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result);
        },
      );

      stream.end(fileBuffer);
    });
  }
}

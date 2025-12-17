import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import env from "../utils/env";

interface CloudinaryParams {
  folder: string;
  allowed_formats: string[];
}

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "booking_images",
    allowed_formats: ["jpg", "png"],
  } as CloudinaryParams,
});

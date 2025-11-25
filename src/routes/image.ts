import { Router } from "express";
import { uploadImage } from "../controllers/image";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { asyncHandler } from "../exceptions/async-handler";

export const ImageRoutes: Router = Router();

ImageRoutes.post("/upload", uploadMiddleware.single("image"), asyncHandler(uploadImage))

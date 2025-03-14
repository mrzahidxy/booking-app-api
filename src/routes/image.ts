import { Router } from "express";
import { uploadImage } from "../controllers/image";
import multer from "multer";
import { storage } from "../config/cloudinary";

export const ImageRoutes: Router = Router();

const upload = multer({ storage: storage });

ImageRoutes.post("/upload", upload.single("image"), uploadImage)
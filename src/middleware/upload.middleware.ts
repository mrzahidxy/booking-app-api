import multer from "multer";
import { storage } from "../services/cloudinary.service";

export const uploadMiddleware = multer({ storage });

import { Request, Response } from "express";
import { buildImageUploadResponse } from "../services/image.service";

// ✅ Image Upload Controller
export const uploadImage = async (req: Request, res: Response) => {
    // Check if a file is uploaded
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }

    // ✅ Return the Cloudinary URL
    const response = buildImageUploadResponse(req.file.path);
    return res.status(response.statusCode).send(response);
};

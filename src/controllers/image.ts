import { Request, Response } from "express";
import { HTTPSuccessResponse } from "../helpers/success-response";

// ✅ Image Upload Controller
export const uploadImage = async (req: Request, res: Response) => {
    // Check if a file is uploaded
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }

    // ✅ Return the Cloudinary URL
    const iamgeUrl = {
        imageUrl: req.file.path,
    }

    const response = new HTTPSuccessResponse("Image uploaded successfully", 200, iamgeUrl);
    return res.status(response.statusCode).send(response);
};


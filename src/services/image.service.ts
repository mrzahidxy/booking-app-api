import { HTTPSuccessResponse } from "../helpers/success-response";

export const buildImageUploadResponse = (imageUrl: string) => {
  return new HTTPSuccessResponse("Image uploaded successfully", 200, {
    imageUrl,
  });
};

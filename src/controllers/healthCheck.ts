// healthCheck.controller.ts
import { Request, Response } from "express";

export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "API is healthy 🟢",
    timestamp: new Date().toISOString(),
  });
};

// healthCheck.controller.ts
import { Request, Response } from "express";
import prisma from "../utils/prisma";


export const healthCheck = async (req: Request, res: Response) => {
  const started = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: "ok",
      server: "up",
      db: "up",
      responseTimeMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(503).json({
      status: "degraded",
      server: "up",
      db: "down",
      error: error?.message ?? "Unknown error",
      responseTimeMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
  }
};

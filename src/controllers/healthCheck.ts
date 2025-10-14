// healthCheck.controller.ts
import { Request, Response } from "express";
import prisma from "../connect";
import logger from "../utils/logger";

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: "ok",
      message: "API is healthy 🟢",
      database: "connected 🟢",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Log the actual error for debugging purposes
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      status: "error",
      message: "Database connection failed 🔴",
      database: "disconnected 🔴",
      timestamp: new Date().toISOString(),
    });
  }
};
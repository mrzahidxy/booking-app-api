// healthCheck.controller.ts
import { Request, Response } from "express";
import prisma from "../utils/prisma";

const DB_TIMEOUT_MS = 500;

export const liveCheck = (_req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

export const healthCheck = async (req: Request, res: Response) => {
  const started = Date.now();
  const shouldCheckDb =
    String(req.query.db ?? "").toLowerCase() === "true" ||
    String(req.query.db ?? "").toLowerCase() === "1";

  let dbStatus: "skipped" | "up" | "down" | "timeout" = "skipped";
  let dbLatencyMs: number | undefined;
  let dbError: string | undefined;
  let timeout: NodeJS.Timeout | undefined;

  if (shouldCheckDb) {
    try {
      await Promise.race([
        (async () => {
          const dbStarted = Date.now();
          await prisma.$queryRaw`SELECT 1`;
          dbLatencyMs = Date.now() - dbStarted;
          dbStatus = "up";
        })(),
        new Promise((_resolve, reject) => {
          timeout = setTimeout(() => reject(new Error("DB_TIMEOUT")), DB_TIMEOUT_MS);
        }),
      ]);
    } catch (error: any) {
      dbStatus = error?.message === "DB_TIMEOUT" ? "timeout" : "down";
      dbError = error?.message;
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  const status = dbStatus === "down" || dbStatus === "timeout" ? "degraded" : "ok";
  const statusCode = status === "ok" ? 200 : 503;

  return res.status(statusCode).json({
    status,
    server: "up",
    db: dbStatus,
    dbLatencyMs,
    responseTimeMs: Date.now() - started,
    timestamp: new Date().toISOString(),
    ...(dbError ? { error: dbError } : {}),
  });
};

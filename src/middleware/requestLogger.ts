import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log the incoming request
  logger.info(`Incoming Request: ${req.method} ${req.path}`, {
    method: req.method,
    url: req.url,
    query: req.query,
    params: req.params,
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  // Capture the response finish to log response details
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`Outgoing Response: ${req.method} ${req.path} ${res.statusCode}`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  });

  next();
};

export default requestLogger;
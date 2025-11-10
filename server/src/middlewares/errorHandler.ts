import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(
      `${err.statusCode} - ${err.message} - ${_req.originalUrl} - ${_req.method} - ${_req.ip}`
    );

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Handle unexpected errors
  logger.error(
    `500 - ${err.message} - ${_req.originalUrl} - ${_req.method} - ${_req.ip}`
  );
  logger.error(err.stack);

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};

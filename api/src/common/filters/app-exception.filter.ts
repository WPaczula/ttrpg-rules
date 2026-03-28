import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AppException, ErrorCode } from '../error-codes';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let errorCode: string;
    let message: string | string[];

    if (exception instanceof AppException) {
      statusCode = exception.statusCode;
      errorCode = exception.errorCode;
      message = exception.message;
      this.logger.warn(
        `${request.method} ${request.url} → ${statusCode} ${errorCode}: ${message}`,
      );
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (statusCode === 400 && typeof body === 'object' && body !== null && 'message' in body) {
        errorCode = ErrorCode.VALIDATION_ERROR;
        message = (body as { message: string | string[] }).message;
      } else {
        errorCode = ErrorCode.INTERNAL_ERROR;
        message = typeof body === 'string' ? body : (body as { message?: string }).message ?? 'Unknown error';
      }
      this.logger.warn(
        `${request.method} ${request.url} → ${statusCode} ${errorCode}: ${JSON.stringify(message)}`,
      );
    } else {
      statusCode = 500;
      errorCode = ErrorCode.INTERNAL_ERROR;
      message = 'Internal server error';
      this.logger.error(
        `${request.method} ${request.url} → 500 unhandled exception`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({
      error: errorCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

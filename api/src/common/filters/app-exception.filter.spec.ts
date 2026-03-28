import { AppExceptionFilter } from './app-exception.filter';
import { AppException, ErrorCode } from '../error-codes';
import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';

function createMockHost(responseBody: { json: jest.Mock; status: jest.Mock }) {
  return {
    switchToHttp: () => ({
      getResponse: () => responseBody,
      getRequest: () => ({ url: '/test', method: 'GET' }),
    }),
  } as unknown as ArgumentsHost;
}

describe('AppExceptionFilter', () => {
  let filter: AppExceptionFilter;
  let json: jest.Mock;
  let status: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new AppExceptionFilter();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    host = createMockHost({ json, status });
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  it('should handle AppException with correct error code and status', () => {
    const exception = new AppException(
      ErrorCode.CHARACTER_NOT_FOUND,
      404,
      'Character not found',
    );

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'CHARACTER_NOT_FOUND',
        message: 'Character not found',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should handle HttpException (e.g. validation errors)', () => {
    const exception = new HttpException(
      {
        message: ['name must be a string'],
        error: 'Bad Request',
        statusCode: 400,
      },
      400,
    );

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'VALIDATION_ERROR',
        message: ['name must be a string'],
        timestamp: expect.any(String),
      }),
    );
  });

  it('should handle unknown errors as INTERNAL_ERROR', () => {
    const exception = new Error('something broke');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
        timestamp: expect.any(String),
      }),
    );
  });
});

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CHARACTER_NOT_FOUND = 'CHARACTER_NOT_FOUND',
  SRD_RESOURCE_NOT_FOUND = 'SRD_RESOURCE_NOT_FOUND',
  INVALID_SRD_REFERENCE = 'INVALID_SRD_REFERENCE',
  DOMAIN_CARD_NOT_AVAILABLE = 'DOMAIN_CARD_NOT_AVAILABLE',
  DUPLICATE_DOMAIN_CARD = 'DUPLICATE_DOMAIN_CARD',
  EXPERIENCE_NOT_FOUND = 'EXPERIENCE_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class AppException extends Error {
  constructor(
    public readonly errorCode: ErrorCode,
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export class NotFoundException extends AppException {
  constructor(errorCode: ErrorCode, message: string) {
    super(errorCode, 404, message);
  }
}

export class BadRequestException extends AppException {
  constructor(errorCode: ErrorCode, message: string) {
    super(errorCode, 400, message);
  }
}

export class ConflictException extends AppException {
  constructor(errorCode: ErrorCode, message: string) {
    super(errorCode, 409, message);
  }
}

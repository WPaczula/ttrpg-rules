export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CHARACTER_NOT_FOUND = 'CHARACTER_NOT_FOUND',
  SRD_RESOURCE_NOT_FOUND = 'SRD_RESOURCE_NOT_FOUND',
  INVALID_SRD_REFERENCE = 'INVALID_SRD_REFERENCE',
  DOMAIN_CARD_NOT_AVAILABLE = 'DOMAIN_CARD_NOT_AVAILABLE',
  DUPLICATE_DOMAIN_CARD = 'DUPLICATE_DOMAIN_CARD',
  EXPERIENCE_NOT_FOUND = 'EXPERIENCE_NOT_FOUND',
  MAX_LEVEL_REACHED = 'MAX_LEVEL_REACHED',
  INVALID_ADVANCEMENT = 'INVALID_ADVANCEMENT',
  ADVANCEMENT_SLOT_FULL = 'ADVANCEMENT_SLOT_FULL',
  TRAIT_ALREADY_MARKED = 'TRAIT_ALREADY_MARKED',
  EXPERIENCE_MODIFIER_MAXED = 'EXPERIENCE_MODIFIER_MAXED',
  MISSING_EXPERIENCE_NAME = 'MISSING_EXPERIENCE_NAME',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
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

export class UnauthorizedException extends AppException {
  constructor(message: string) {
    super(ErrorCode.UNAUTHORIZED, 401, message);
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string) {
    super(ErrorCode.FORBIDDEN, 403, message);
  }
}

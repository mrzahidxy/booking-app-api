// message, status code, error codes, error
export class HTTPException extends Error {
  message: string;
  errorCode: ErrorCode;
  statusCode: number;
  errors: any;

  constructor(
    message: string,
    errorCode: ErrorCode,
    statusCode: number,
    errors: any
  ) {
    super(message);
    this.message = message;
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export enum ErrorCode {
  USER_NOT_FOUND = 1001,
  USER_ALREADY_EXISTS = 1002,

  ROLE_ALREADY_EXISTS = 1003,

  ROLE_NOT_FOUND = 1004,
  INCORRECT_PASSWORD = 1006,
  ADDRESS_NOT_FOUND = 1005,
  PERMISIION_NOT_FOUND = 1007,
  PERMISSION_ALREADY_EXISTS = 1008,



  INTERNAL_EXCEPTION = 3001,

  NO_TOKEN_PROVIDED = 4001,
  INVALID_TOKEN = 4003,
  NO_AUTHORIZED = 4002,
  UNPROCESSABLE_ENTITY = 5001,

  RESTAURANT_NOT_FOUND = 6001,
  RESERVATION_NOT_FOUND = 6002,
  NOT_ENOUGH_SEATS = 6003,
  HOTEL_NOT_FOUND = 6004,
  ROOM_NOT_FOUND = 6005,

  BAD_REQUEST = 7001,
  REVIEW_NOT_FOUND = 7002,
  BOOKING_NOT_FOUND = 7003,
  NOT_ENOUGH_ROOMS = 7004,
  NOTIFICATION_NOT_FOUND = 7005,
}

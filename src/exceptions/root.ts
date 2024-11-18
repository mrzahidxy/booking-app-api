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
  USER_ALREADY_EXISTS = 1002,  // Typo fixed from EXITS to EXISTS
  INCORRECT_PASSWORD = 1003,
  ADDRESS_NOT_FOUND = 1004,    // Avoided conflict with USER_NOT_FOUND
  
  PRODUCT_NOT_FOUND = 2001,
  
  CART_NOT_FOUND = 2002,       // Fixed leading zero in 001

  ORDER_NOT_FOUND = 2003,
  
  INTERNAL_EXCEPTION = 3001,
  
  NO_TOKEN_PROVIDED = 4001,
  NO_AUTHORIZED = 4002,        // Fixed typo from AUTRHORIZED to AUTHORIZED
  
  UNPROCESSABLE_ENTITY = 5001,

  RESTAURANT_NOT_FOUND = 6001,
  RESERVATION_NOT_FOUND = 6002,
  NOT_ENOUGH_SEATS = 6003,
  HOTEL_NOT_FOUND = 6004,
  ROOM_NOT_FOUND = 6005,
}

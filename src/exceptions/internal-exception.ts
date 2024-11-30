import { HTTPException } from "./root";

export class InternalException extends HTTPException {
  constructor(message: string, errors: any, errorCode: number) {

    console.log('errors', errors);
    super(message, errors, 500, errorCode);
  }
}

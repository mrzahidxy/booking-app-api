import { HTTPException } from "./root";


export class UnauthorizedException extends HTTPException{
    constructor(message: string, errorCode: number) {
        super(message, errorCode, 401, null);
    }
}
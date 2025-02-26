import HttpStatus from "http-status-codes";

export class UserAlreadyExistsError extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.statusCode = HttpStatus.CONFLICT;
        this.name = "UserAlreadyExistsError";
    }
}
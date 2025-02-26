import {BadRequestError} from "routing-controllers";

export class ValidationError extends BadRequestError {
    public errors: any;

    constructor(message: string, errors: any) {
        super(message);
        this.errors = errors;
    }
}
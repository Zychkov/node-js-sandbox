import {plainToInstance} from "class-transformer";
import {validate} from "class-validator";
import {ValidationError} from "../errors/validation.error";

export async function validateDTO<T>(dtoClass: new () => T, data: object): Promise<T> {
    const dtoInstance = plainToInstance(dtoClass, data) as T;

    const errors = await validate(dtoInstance as object);
    if (errors.length > 0) {
        const validationMessages = errors.map(err => ({
            field: err.property,
            errors: Object.values(err.constraints || {}),
        }));

        throw new ValidationError("Validation failed", validationMessages);
    }

    return dtoInstance;
}
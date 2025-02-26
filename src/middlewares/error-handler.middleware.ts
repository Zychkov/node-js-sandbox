import {ExpressErrorMiddlewareInterface, Middleware} from "routing-controllers";
import {Request, Response, NextFunction} from 'express';
import logger from "../utils/logger";

@Middleware({type: "after"})
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    error(error: any, request: Request, response: Response, next: NextFunction): void {
        if (response.headersSent) {
            return next(error);
        }

        const res = {
            name: error.name,
            message: error.message,
            statusCode: error.statusCode ?? error.httpCode,
            errors: error.errors
        };

        logger.error(res)

        response
            .status(error.statusCode ?? error.httpCode ?? 500)
            .json(res);
    }
}

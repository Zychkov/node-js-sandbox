import {getMetadataArgsStorage} from "routing-controllers";
import {routingControllersToSpec} from "routing-controllers-openapi";
import * as swaggerUi from "swagger-ui-express";
import express from "express";
import {validationMetadatasToSchemas} from "class-validator-jsonschema";
import {UserController} from "../controllers/user.controller";
import {OpenAPIObject, SchemaObject, ReferenceObject} from "openapi3-ts";
import logger from "./logger";

export function setupSwagger(app: express.Express) {

    const schemas = validationMetadatasToSchemas({
        refPointerPrefix: "#/components/schemas/"
    }) as { [schema: string]: SchemaObject | ReferenceObject };

    const storage = getMetadataArgsStorage();
    const options = {
        controllers: [UserController],
        development: true
    };

    const swaggerSpec: Partial<OpenAPIObject> = {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            version: "1.0.0"
        },
        components: {
            schemas: {
                ...schemas,
                ErrorResponse: {
                    type: "object",
                    properties: {
                        statusCode: {type: "integer"},
                        message: {type: "string"},
                        name: {type: "string"}
                    }
                }
            }
        }
    };

    const spec = routingControllersToSpec(storage, options, swaggerSpec);

    logger.info("Final spec components schemas:", Object.keys(spec.components?.schemas || {}));

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
}

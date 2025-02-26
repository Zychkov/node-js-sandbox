import 'reflect-metadata';

import express from "express";
import dotenv from "dotenv";
import {useExpressServer} from "routing-controllers";
import {UserController} from "./controllers/user.controller";
import 'source-map-support/register';

dotenv.config();

const app = express();

app.use(express.json());

useExpressServer(app, {
    controllers: [UserController],
    middlewares: [],
    validation: true,
    defaultErrorHandler: false,
});

export default app;

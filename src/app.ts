import 'reflect-metadata';

import express from 'express';
import dotenv from 'dotenv';
import {useExpressServer} from 'routing-controllers';
import {UserController} from './controllers/user.controller';
import 'source-map-support/register';
import {authorizationChecker} from './utils/jwt';
import {setupSwagger} from "./utils/swagger";

dotenv.config({
    override: true,
    path: '.env'
});

const app = express();

useExpressServer(app, {
    controllers: [UserController],
    middlewares: [],
    validation: true,
    classTransformer: true,
    defaultErrorHandler: false,
    authorizationChecker: authorizationChecker,
    currentUserChecker: action => action.request.user,
});

app.use(express.json());
setupSwagger(app);

export default app;

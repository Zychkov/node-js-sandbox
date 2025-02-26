import 'reflect-metadata';

import express from 'express';
import dotenv from 'dotenv';
import {useExpressServer} from 'routing-controllers';
import {UserController} from './controllers/user.controller';
import 'source-map-support/register';
import {authorizationChecker} from './utils/jwt';

dotenv.config({
    override: true,
    path: '.env'
});

const app = express();

useExpressServer(app, {
    controllers: [UserController],
    middlewares: [],
    validation: true,
    defaultErrorHandler: false,
    authorizationChecker: authorizationChecker,
    currentUserChecker: action => action.request.user,
});

app.use(express.json());

export default app;

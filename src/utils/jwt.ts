import jwt from 'jsonwebtoken';
import {User} from "../models/user.model";
import {Action} from "routing-controllers";

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

interface UserJwtPayload extends jwt.JwtPayload {
    userId: string
}

export const generateToken = (user: User) => {
    return jwt.sign(
        {
            userId: user._id
        } as UserJwtPayload,
        JWT_SECRET,
        {expiresIn: '10m'}
    );
};

export function authorizationChecker(action: Action): boolean {
    const token = action.request.headers["authorization"]?.split(" ")[1];
    if (!token) return false;

    try {
        const tokenData = verifyToken(token) as UserJwtPayload;
        action.request.user = tokenData.userId;
        return true;
    } catch (error) {
        return false;
    }
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
};

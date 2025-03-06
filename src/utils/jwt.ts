import jwt from 'jsonwebtoken';
import {User} from "../models/user.model";
import {Action} from "routing-controllers";
import {Role} from "../models/enums/role.enum";

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

interface UserJwtPayload extends jwt.JwtPayload {
    userId: string,
    role: Role
}

export const generateToken = (user: User) => {
    return jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        JWT_SECRET,
        {expiresIn: '10m'}
    );
};

export function authorizationChecker(action: Action, roles?: Role[]): boolean {
    const token = action.request.headers["authorization"]?.split(" ")[1];
    if (!token) return false;

    try {
        const tokenData = verifyToken(token);
        action.request.user = tokenData.userId;

        if (!roles || roles.length === 0) {
            return true;
        }

        return roles.includes(tokenData.role);
    } catch (error) {
        return false;
    }
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET) as UserJwtPayload;
};

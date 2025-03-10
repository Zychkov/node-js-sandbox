import {UserStatus} from "../models/enums/user-status.enum";
import {Role} from "../models/enums/role.enum";
import {UserDAO} from "../dao/user.dao";
import {User} from "../models/user.model";
import {ObjectId} from "mongodb";
import {NotFoundError} from "routing-controllers";
import bcrypt from "bcrypt";

export class UserService {
    private userDAO = new UserDAO();

    async register(userData: Partial<User>): Promise<User> {
        const SALT_ROUNDS: number = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 31;

        const hashedPassword: string = await bcrypt.hash(userData.password!, SALT_ROUNDS);

        if (userData.username === process.env.ADMIN_NAME) {
            userData.role = Role.ADMIN
        } else {
            userData.role = Role.USER
        }

        const newUser = {
            ...userData,
            password: hashedPassword,
            status: UserStatus.ACTIVE,
            role: userData.role,
            friends: []
        } as User;
        return this.userDAO.create(newUser);
    }

    async getUsersWithFilterAndPagination(
        limit: number,
        skip: number,
        includeAdmin: boolean
    ): Promise<User[]> {
        return this.userDAO.findByFilterWithPagination(limit, skip, includeAdmin);
    }

    async getUserById(id: string): Promise<User | null> {
        return this.userDAO.findById(id);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.userDAO.findByEmail(email);
    }

    async getUserByName(name: string): Promise<User | null> {
        return this.userDAO.findByName(name);
    }

    async updateUser(email: string, updateData: Partial<User>): Promise<User | null> {
        return this.userDAO.updateByEmail(email, updateData);
    }

    async deleteUser(email: string): Promise<boolean> {
        return this.userDAO.delete(email);
    }

    async addFriend(userId: string, friendId: string): Promise<User> {
        const user = await this.userDAO.findById(userId);
        if (!user) {
            throw new NotFoundError(`User not found.`);
        }

        user.friends.push(new ObjectId(friendId));

        return this.userDAO.updateUserById(user);
    }

    async removeFriend(userId: string, friendId: string): Promise<User> {
        const user = await this.getUserById(userId);
        if (!user) {
            throw new NotFoundError("User not found.");
        }

        user.friends = user.friends?.filter(id => id.toString() !== friendId) || [];

        await this.userDAO.updateById(userId, {friends: user.friends});
        return user;
    }
}
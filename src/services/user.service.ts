import {UserStatus} from "../models/enums/user-status.enum";
import {Role} from "../models/enums/role.enum";
import {UserDAO} from "../dao/user.dao";
import {User} from "../models/user.model";
import {ObjectId} from "mongodb";
import {NotFoundError} from "routing-controllers";

export class UserService {
    private userDAO = new UserDAO();

    async register(userData: Partial<User>): Promise<User> {
        const newUser = {...userData, status: UserStatus.ACTIVE, role: Role.USER, friends: []} as User;
        return this.userDAO.create(newUser);
    }

    async getAllUsers(): Promise<User[]> {
        return this.userDAO.findAll();
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
        return this.userDAO.update(email, updateData);
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
}
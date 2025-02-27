import {Collection, ObjectId} from "mongodb";
import {Database} from "../utils/database";
import {User} from "../models/user.model";
import {BadRequestError, NotFoundError} from "routing-controllers";

export class UserDAO {
    private collection: Collection<User>;

    constructor() {
        this.collection = Database.getDb().collection<User>("users");
    }

    async create(user: User): Promise<User> {
        await this.collection.insertOne(user);
        return user;
    }

    async findById(id: string): Promise<User | null> {
        if (!ObjectId.isValid(id)) {
            throw new BadRequestError("Invalid ID format");
        }

        return await this.collection.findOne({_id: new ObjectId(id)} as any);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.collection.findOne({email});
    }

    async findByName(username: string): Promise<User | null> {
        return this.collection.findOne({username});
    }

    async findAll(): Promise<User[]> {
        return this.collection.find().toArray();
    }

    async update(email: string, updateData: Partial<User>): Promise<User | null> {
        await this.collection.updateOne({email}, {$set: updateData});
        return this.findByEmail(email);
    }

    async updateUserById(updateData: Partial<User>): Promise<User> {
        const result = await this.collection.findOneAndUpdate(
            {_id: updateData._id},
            {$set: updateData},
            {returnDocument: 'after'}
        );

        if (!result) {
            throw new NotFoundError(`with ID ${updateData._id} not found.`)
        }

        return result;
    }

    async delete(email: string): Promise<boolean> {
        const result = await this.collection.deleteOne({email});
        return result.deletedCount > 0;
    }
}
import {MongoClient} from "mongodb";
import logger from "./logger";
import {UserService} from '../services/user.service';

export class Database {
    private static client: MongoClient;
    private static mongoUrl = process.env.MONGO_URL;
    private static dbName = process.env.DB_NAME;

    static async connect() {
        if (!this.client) {
            this.client = new MongoClient(`${this.mongoUrl}/${this.dbName}`);
            await this.client.connect();
            logger.info("Connected to MongoDB");

            await Database.createAdmin();
        }
    }

    static getDb() {
        if (!this.client) {
            throw new Error("Database not connected!");
        }
        return this.client.db(this.dbName);
    }

    private static async createAdmin() {
        const userService = new UserService();
        const adminName = process.env.ADMIN_NAME ?? "admin"
        const admin = await userService.getUserByName(adminName);

        if (!admin) {
            await userService.register({
                username: adminName,
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASS
            })
            logger.debug("Admin created")
        } else {
            logger.debug("Admin already exists")
        }
    }
}
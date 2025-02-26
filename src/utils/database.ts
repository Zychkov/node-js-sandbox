import {MongoClient} from "mongodb";
import logger from "./logger";

export class Database {
    private static client: MongoClient;
    private static mongoUrl = process.env.MONGO_URL;
    private static dbName = process.env.DB_NAME;

    static async connect() {
        if (!this.client) {
            this.client = new MongoClient(`${this.mongoUrl}/${this.dbName}`);
            await this.client.connect();
            logger.info("Connected to MongoDB");
        }
    }

    static getDb() {
        if (!this.client) {
            throw new Error("Database not connected!");
        }
        return this.client.db(this.dbName);
    }
}
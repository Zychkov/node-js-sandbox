import { MongoClient } from "mongodb";
import logger from "./logger";

export class Database {
    private static client: MongoClient;
    // private static dbName = process.env.DB_NAME;
    private static dbName = "v_poiske";

    static async connect() {
        if (!this.client) {
            this.client = new MongoClient(process.env.MONGO_URL ?? "mongodb://localhost:27017" + this.dbName);
            await this.client.connect();
            logger.info("Connected to MongoDB")
        }
    }

    static getDb() {
        if (!this.client) {
            throw new Error("Database not connected!");
        }
        return this.client.db(this.dbName);
    }
}
import { MongoClient } from "mongodb";

export class Database {
    private static client: MongoClient;
    private static dbName = process.env.DB_NAME;

    static async connect() {
        if (!this.client) {
            this.client = new MongoClient(process.env.MONGO_URL ?? "mongodb://localhost:27017");
            await this.client.connect();
            console.log("Connected to MongoDB");
        }
    }

    static getDb() {
        if (!this.client) {
            throw new Error("Database not connected!");
        }
        return this.client.db(this.dbName);
    }
}
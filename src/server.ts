import app from "./app";
import {Database} from "./utils/database";

const PORT = process.env.PORT || 5001;

async function startServer() {
    try {
        await Database.connect();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        })
    } catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1);
    }
}

startServer();

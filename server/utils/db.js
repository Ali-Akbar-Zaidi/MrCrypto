const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MongoDb_URI);
        console.log("Database connected successfully!");
    } catch (error) {
        console.error("Failed to connect to database.", error);
        process.exit(0);
    }
}

module.exports = connectDB;
// config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    const DB_PASSWORD = process.env.MONGODB_PASSWORD;
    const DB_USER = process.env.MONGODB_USERNAME;
    const DB_NAME = process.env.MONGODB_DBNAME || "test";
    const mongoURI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.p4jc6.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

    try {
      await mongoose.connect(mongoURI);
      console.log("MongoDB connected successfully");
    } catch (err) {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    }
  }
};

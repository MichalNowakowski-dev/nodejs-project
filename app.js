// app.js
import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

export default app;

// routes/userRoutes.js
import express from "express";
import { getUsers } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", protect, getUsers); // Now only accessible with a valid token

export default router;

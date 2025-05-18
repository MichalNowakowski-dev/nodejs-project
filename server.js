// server.js
import express from "express";
import mongoose from "mongoose";

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// MongoDB connection string
const DB_PASSWORD = process.env.MONGODB_PASSWORD;
const DB_USER = process.env.MONGODB_USERNAME;
const DB_NAME = process.env.MONGODB_DBNAME;
const mongoURI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.p4jc6.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if connection fails
  });

// Define a basic schema and model
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a model from the schema
const User = mongoose.model("User", UserSchema);

// Define API routes

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new user
app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    // Create a new user
    const newUser = new User({
      name,
      email,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(400).json({ message: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

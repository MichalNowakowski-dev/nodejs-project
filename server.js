// Import the express module
import express from "express";

// Create an Express application
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define a route for GET requests to the root URL
app.get("/", (req, res) => {
  res.send("Hello World from your first Node.js server!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

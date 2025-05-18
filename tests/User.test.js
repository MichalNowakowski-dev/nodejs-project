// tests/user.test.js
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import supertest from "supertest";
import { app, User } from "../app.js";

const request = supertest(app);
let mongoServer;

// Set up the in-memory database before tests
beforeAll(async () => {
  // Create an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect Mongoose to the in-memory database
  await mongoose.connect(uri);
});

// Clear the database between tests
beforeEach(async () => {
  // Clear all collections before each test
  await User.deleteMany({});
});

// Disconnect and close MongoDB after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Test cases
describe("User API", () => {
  // Test getting all users (empty array initially)
  test("GET /api/users should return empty array initially", async () => {
    const response = await request.get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Test creating a new user
  test("POST /api/users should create a new user", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
    };

    const response = await request.post("/api/users").send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe(userData.name);
    expect(response.body.email).toBe(userData.email);
  });

  // Test that we can retrieve users after creating one
  test("GET /api/users should return array with users", async () => {
    // First create a user
    const userData = {
      name: "Another Test User",
      email: "another@example.com",
    };

    await request.post("/api/users").send(userData);

    // Now get all users
    const response = await request.get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe(userData.name);
  });

  // Test that we get validation error for missing fields
  test("POST /api/users should return 400 if required fields are missing", async () => {
    const incompleteUserData = {
      name: "Incomplete User",
      // Missing email field
    };

    const response = await request.post("/api/users").send(incompleteUserData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  // Test duplicate email validation
  test("POST /api/users should return 400 for duplicate email", async () => {
    const userData = {
      name: "Original User",
      email: "duplicate@example.com",
    };

    // Create first user
    await request.post("/api/users").send(userData);

    // Try to create another user with same email
    const duplicateResponse = await request.post("/api/users").send({
      name: "Duplicate User",
      email: "duplicate@example.com",
    });

    expect(duplicateResponse.status).toBe(400);
    expect(duplicateResponse.body).toHaveProperty("message");
  });
});

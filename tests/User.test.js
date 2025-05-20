// tests/user.test.js
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import supertest from "supertest";
import app from "../app.js";
import { User } from "../models/User.js";

const request = supertest(app);
let mongoServer;
let token;

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
  await User.deleteMany({});

  // Register a user and get the token
  const response = await request.post("/api/auth/register").send({
    name: "Test Auth User",
    email: "authusertest@example.com",
    password: "testpassword",
  });

  token = response.body.token;
});

// Disconnect and close MongoDB after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("User API", () => {
  test("GET /api/users should return array with one user", async () => {
    const response = await request
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });
  test("POST /api/auth/register should create a new user", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    const response = await request.post("/api/auth/register").send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe(userData.name);
    expect(response.body.email).toBe(userData.email);
  });
  test("GET /api/users should return array with users", async () => {
    // First create a user
    const userData = {
      name: "Another Test User",
      email: "another@example.com",
      password: "password12345",
    };

    await request.post("/api/auth/register").send(userData);

    // Now get all users
    const response = await request
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2); // One from before and one just created
    expect(response.body[1].name).toBe(userData.name);
  });
  test("POST /api/auth/register should return 400 if required fields are missing", async () => {
    const incompleteUserData = {
      name: "Incomplete User",
      email: "email@xxx.com",
      // missing psasword
    };

    const response = await request
      .post("/api/auth/register")
      .send(incompleteUserData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
  test("POST /api/auth/register should return 400 for duplicate email", async () => {
    const userData = {
      name: "Original User",
      email: "duplicate@example.com",
    };

    // Create first user
    await request.post("/api/auth/register").send(userData);

    // Try to create another user with same email
    const duplicateResponse = await request.post("/api/auth/register").send({
      name: "Duplicate User",
      email: "duplicate@example.com",
    });

    expect(duplicateResponse.status).toBe(400);
    expect(duplicateResponse.body).toHaveProperty("message");
  });
});

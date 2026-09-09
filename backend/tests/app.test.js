const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../app");

// ================= API HEALTH TEST =================

test("GET /api/test should return API working message", async () => {
    const response = await request(app)
        .get("/api/test");

    assert.strictEqual(response.statusCode, 200);

    assert.deepStrictEqual(response.body, {
        message: "API is working"
    });
});

// ================= REGISTER VALIDATION TEST =================

test("POST /api/auth/register should reject missing fields", async () => {
    const response = await request(app)
        .post("/api/auth/register")
        .send({});

    assert.strictEqual(response.statusCode, 400);

    assert.strictEqual(
        response.body.message,
        "All fields are required"
    );
});

// ================= LOGIN VALIDATION TEST =================

test("POST /api/auth/login should reject missing credentials", async () => {
    const response = await request(app)
        .post("/api/auth/login")
        .send({});

    assert.strictEqual(response.statusCode, 400);

    assert.strictEqual(
        response.body.message,
        "Email and password are required"
    );
});

// ================= AUTHORIZATION TEST =================

test("GET /api/auth/profile should reject unauthenticated request", async () => {
    const response = await request(app)
        .get("/api/auth/profile");

    assert.strictEqual(response.statusCode, 401);

    assert.strictEqual(
        response.body.message,
        "Authorization token required"
    );
});
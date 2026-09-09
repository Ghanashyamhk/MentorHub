const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../app");

test("GET /api/test should return API working message", async () => {
    const response = await request(app)
        .get("/api/test");

    assert.strictEqual(response.statusCode, 200);

    assert.deepStrictEqual(response.body, {
        message: "API is working"
    });
});
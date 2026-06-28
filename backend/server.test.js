const request = require("supertest");
const app = require("./server");

test("GET /", async () => {
  const res = await request(app).get("/");
  expect(res.statusCode).toBe(200);
  expect(res.body.backend).toBe("ok");
});

test("GET /health", async () => {
  const res = await request(app).get("/health");
  expect(res.statusCode).toBe(200);
  expect(res.body.backend.status).toBe("ok");
  expect(res.body.database).toHaveProperty("state");
});

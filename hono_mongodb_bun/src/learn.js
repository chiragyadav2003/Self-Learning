import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";

let videos = [];

const app = new Hono();

app.get("/", (c) => {
    return c.html("<h1>Welcome to hono backend</h1>")
})

export default app;
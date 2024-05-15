import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";

let videos = [];

const app = new Hono();

app.get("/", (c) => {
    return c.html("<h1>Welcome to hono backend</h1>")
})

app.post("/video", async (c) => {
    const { videoName, channelName, duration } = await c.req.json();
    const newVideo = {
        id: uuidv4(),
        videoName,
        channelName,
        duration
    }
    videos.push(newVideo);
    return c.json(newVideo);
})

export default app;
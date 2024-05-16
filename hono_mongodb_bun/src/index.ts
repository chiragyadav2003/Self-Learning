import { Hono } from 'hono';
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import dbConnect from './db/connect';

const app = new Hono()

// middlewares
app.use(poweredBy());
app.use(logger());

dbConnect()
  .then(() => {
    app.get("/", async (c) => {
      return c.text("mongodb connected")
    })
  })
  .catch((err) => {
    app.get("/*", (c) => {
      return c.text(`Failed to connect mongodb: ${err?.message}`);
    })
  })

app.onError((err, c) => {
  console.error(`${err}`)
  return c.text(`App Error: ${err.message}`, 500)
})



export default app

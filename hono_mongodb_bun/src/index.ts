import { Hono } from 'hono';
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import dbConnect from './db/connect';
import FavYoutubeVideosModel from './db/fav-youtube-model';
import { isValidObjectId } from 'mongoose';
import { stream, streamText, streamSSE } from 'hono/streaming';
import { start } from 'repl';



const app = new Hono()

// middlewares
app.use(poweredBy());
app.use(logger());

dbConnect()
  .then(() => {
    // GET list of all videos
    app.get("/", async (c) => {
      const documents = await FavYoutubeVideosModel.find();
      if (!documents) {
        return c.json({ message: "Something went wrong" });
      }
      // get all document in object form
      return c.json(
        documents.map((document) => document.toObject()),
        200 //status code
      )
    })

    //creating document
    app.post("/", async (c) => {
      const formData = await c.req.json();

      //if we do not have thumbnailURL, we will delete it from form
      if (!formData.thumbnailUrl) delete formData.thumbnailUrl;

      const favYoutubeVideoObj = new FavYoutubeVideosModel(formData);
      try {
        const doc = await favYoutubeVideoObj.save();
        return c.json(doc.toObject(), 201);
      } catch (error) {
        return c.json((error as any)?.message || "Internal server error", 500);
      }
    })

    //view document by id
    app.get("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      //validate objId
      if (!isValidObjectId(id)) return c.json({ msg: "Invalid id" }, 400);

      const doc = await FavYoutubeVideosModel.findById(id);
      if (!doc) return c.json({ msg: "Document not found" }, 404);
      return c.json(doc.toObject(), 200);
    })

    //stream document description
    app.get("/d/:documentId", async (c) => {
      const id = c.req.param("documentId");
      //validate objId
      if (!isValidObjectId(id)) return c.json({ msg: "Invalid id" }, 400);

      const document = await FavYoutubeVideosModel.findById(id);
      if (!document) return c.json({ msg: "Document not found" }, 404);
      //stream document description
      return streamText(c, async (stream) => {
        stream.onAbort(() => {
          console.log('Aborted!')
        })
        for (let i = 0; i < document.description.length; i++) {
          //write whole word without creating a new line
          await stream.write(document.description[i]);
          //wait 1 sec
          await stream.sleep(100);
        }
      })
    })

    //update
    app.patch("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json({ msg: "Invalid id" }, 400);

      const document = await FavYoutubeVideosModel.findById(id);
      if (!document) return c.json({ msg: "Document not found" }, 404);

      const formData = await c.req.json();

      if (!formData.thumbnailUrl) delete formData.thumbnailUrl;

      try {
        const updatedDoc = await FavYoutubeVideosModel.findByIdAndUpdate(
          id,
          formData,
          {
            new: true
          }
        )
        return c.json(updatedDoc?.toObject(), 200);
      } catch (error) {
        return c.json((error as any)?.message || "Internal server error", 500);
      }
    })

    //delete all
    app.delete("/deleteAll", async (c) => {
      try {
        const res = await FavYoutubeVideosModel.deleteMany();
        console.log("All deleted")
        return c.json({ msg: "All deleted" }, 200)
      } catch (error) {
        return c.json((error as any)?.message || "Internal server error", 500);
      }
    })

    //delete by id
    app.delete("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json({ msg: "Invalid id" }, 400);

      const document = await FavYoutubeVideosModel.findById(id);
      if (!document) return c.json({ msg: "Document not found" }, 404);

      try {
        const deletedDoc = await FavYoutubeVideosModel.findByIdAndDelete(id);
        return c.json(deletedDoc?.toObject(), 200);
      } catch (error) {
        return c.json((error as any)?.message || "Internal server error", 500);
      }
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

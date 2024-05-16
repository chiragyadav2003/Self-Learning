import mongoose from "mongoose";

export default async function dbConnect() {
    // console.log("@string ", process.env.MONGODB_URI)
    try {
        const res = await mongoose.connect(String(process.env.MONGODB_URI));
        console.log("MongoDB connected successfully....");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error;
    }
}

dbConnect();
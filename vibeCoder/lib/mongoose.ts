// src/lib/mongoose.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "test";

if (!MONGODB_URI) {
  throw new Error('❌ Missing environment variable: "MONGODB_URI"');
}

let isConnected = false; // ✅ track connection status

export const connectDB = async () => {
  // ✅ Reuse cached connection if available and still valid
  if (global._mongooseConnection && isConnected && mongoose.connection.readyState === 1) {
    return global._mongooseConnection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000, // ⏱️ extra safety against hanging
      socketTimeoutMS: 45000,  // ⏱️ prevent long idle sockets
    });

    global._mongooseConnection = conn;
    isConnected = true;

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔁 MongoDB reconnected");
      isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err);
    });

    console.log(`✅ MongoDB connected to database: ${DB_NAME}`);
    return conn.connection;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
};

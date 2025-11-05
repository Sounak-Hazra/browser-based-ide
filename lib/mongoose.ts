import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.DB_NAME || "test"

if (!MONGODB_URI) {
  throw new Error('❌ Missing environment variable: "MONGODB_URI"')
}

let isConnected = false // track connection status to avoid re-connecting

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 5000,
    })

    isConnected = true
    return conn.connection
  } catch (err) {
    console.error("❌ MongoDB connection error:", err)
    throw err
  }
}

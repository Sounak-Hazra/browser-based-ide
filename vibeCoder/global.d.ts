import mongoose from "mongoose";

declare global {
    // Extend the global object to include a cached mongoose connection
    var _mongooseConnection: typeof mongoose | null;
}

export {};
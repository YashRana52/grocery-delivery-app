import mongoose from "mongoose";

const mongodbUrl = process.env.MONGODB_URI;
if (!mongodbUrl) {
  throw new Error("Please define MONGODB_URI in .env");
}
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongodbUrl)
      .then((conn) => conn.connection);
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // failed promise cache me na rahe, warna har request hamesha fail hogi
    cached.promise = null;
    throw error;
  }
};

export default connectDb;

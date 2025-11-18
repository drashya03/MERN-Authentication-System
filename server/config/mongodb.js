// fun to connect mongo db

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not defined. Make sure .env is loaded and contains MONGODB_URI"
      );
    }

    mongoose.connection.on("connected", () => console.log("MongoDB connected"));
    mongoose.connection.on("error", (err) =>
      console.error("MongoDB connection error:", err)
    );

    // Mongoose v6+ doesn't require these options but leaving an empty options object is fine
    await mongoose.connect(uri);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;

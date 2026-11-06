import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGODB_URI?.trim();
    if (!rawUri) {
      throw new Error(
        "MONGODB_URI is not defined in environment variables. Please create a .env file with MONGODB_URI"
      );
    }

    // Strip surrounding quotes if present
    const uri = rawUri.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    const defaultDb = process.env.MONGODB_DB?.trim() || "prescripto";

    const hasDatabase = /mongodb(?:\+srv)?:\/\/[^\/?]+\/[^?]+/.test(uri);
    const connectString = hasDatabase ? uri : `${uri}/${defaultDb}`;

    mongoose.connection.on("connected", () => {
      console.log("✅ Database Connected Successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Database Connection Error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ Database Disconnected");
    });

    await mongoose.connect(connectString, {
      dbName: defaultDb,
      serverSelectionTimeoutMS: 10000,
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    process.exit(1); // Exit the process if database connection fails
  }
};

export default connectDB;

// If your MongoDB password contains special characters like @ or #, URL-encode them.

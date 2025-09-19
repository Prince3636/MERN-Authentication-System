import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" MongoDB Connected Successfully");
  } catch (err) {
    console.error(" MongoDB Connection Failed:", err.message);
    process.exit(1); // stop the server if DB fails
  }
};

export default connectDB;

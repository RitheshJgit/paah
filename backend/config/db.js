import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // faster fail
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    console.error("DB ERROR:", error.message);
    process.exit(1);
  }
};

export default connectDB;
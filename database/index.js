import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb+srv://sample123:sample123@cluster0.mgh3v8t.mongodb.net/bookstore'
    );
    console.log('MongoDB connected successfully');
    return true;
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    return false;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
};

export { connectDB, disconnectDB };
export default connectDB;

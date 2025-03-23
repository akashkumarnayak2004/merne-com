import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Directly pass the MongoDB URI
    const conn = await mongoose.connect(
      "mongodb+srv://ece22becf51:8Fpib0eKWwE9i43v@cluster0.ixii2.mongodb.net/ecommerce_db?retryWrites=true&w=majority&appName=Cluster0"
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit the process if there’s an error
  }
};
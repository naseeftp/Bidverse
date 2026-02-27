import mongoose from "mongoose";
import { env } from "./env";

const MONGO_URL=env.MONGODB_URI;

const connectDB=async ():Promise<void>=>{
    try {
        await mongoose.connect(MONGO_URL);
        console.log('data base connected success fully')
    } catch (error) {
        console.log('failed to conncet DB',error);
        process.exit(1)
    }
}

export default connectDB;
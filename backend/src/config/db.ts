import mongoose from "mongoose";
import { env } from "./env";
import { LoggerService } from "../services/implementations/Logger.service";
import dns from 'dns'

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const MONGO_URL = env.MONGODB_URI;
const DbLoggeer = new LoggerService('DBCONFIG')
const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGO_URL);
        DbLoggeer.info('data base connected successfully')
    } catch (error) {
        DbLoggeer.error('Error while connecting db', error)
        process.exit(1)
    }
}

export default connectDB;
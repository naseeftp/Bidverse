import express, { Application } from "express";
import dotenv from "dotenv"
import { env } from './config/env'
import connectDB from "./config/db";
import cors from 'cors'
import {errorHandler } from "./middlewares/error-handler.middleware";
import { BASE_ROUTES } from "./constants/route.constant";
import authRouter from './routes/auth.router'
import auctionHouseRoutes from './routes/auctionHouse.routes'
import adminRoutes from './routes/admin.routes'
import {LoggerService } from "./services/implementations/Logger.service";


dotenv.config()
const app: Application = express()
const appLogger=new LoggerService("App")
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const PORT = env.PORT

app.use(BASE_ROUTES.AUTH,authRouter)
app.use(BASE_ROUTES.AUCTION_HOUSE,auctionHouseRoutes)
app.use(BASE_ROUTES.ADMIN,adminRoutes)


app.use(errorHandler);
const startServer = async () => {
    await connectDB()
    app.listen(PORT, () => {
        appLogger.info(`your application running on port ${PORT}`)
    })
}
startServer()

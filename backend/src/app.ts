import express, { Application } from "express";
import dotenv from "dotenv"
import { createServer } from "http";//NODE'S NATIVE SERVER WRAPPER
import { socketService } from "./services/implementations/socket.service";
import { chatService } from "./di/chat.container";
import { env } from './config/env'
import connectDB from "./config/db";
import { connectRedis } from "./config/redisClient";
import cors from 'cors'
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { BASE_ROUTES } from "./constants/route.constant";
import authRouter from './routes/auth.router'
import auctionHouseRoutes from './routes/auctionHouse.routes'
import adminRoutes from './routes/admin.routes'
import profileRoutes from './routes/profile.routes'
import addressRoutess from './routes/address.routes'
import publicAuctionRoutes from './routes/public.routes'
import auctionItemRoutes from './routes/auctionItem.routes'
import WatchlistRoutes from './routes/watchlist.routes'
import ChatRoutes from './routes/chat.routes'
import BidRoutes from './routes/bid.routes'

import { LoggerService } from "./services/implementations/Logger.service";

dotenv.config()
const app: Application = express()
const appLogger = new LoggerService("App")
const httpServer = createServer(app)//WRAP THE EXPRESS INSTANCE IN AN HTTP SERVER

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
const PORT = env.PORT

app.use(BASE_ROUTES.AUTH, authRouter)
app.use(BASE_ROUTES.AUCTION_HOUSE, auctionHouseRoutes)
app.use(BASE_ROUTES.ADMIN, adminRoutes)
app.use(BASE_ROUTES.PROFILE_MANAGEMENT, profileRoutes)
app.use(BASE_ROUTES.ADDRESS, addressRoutess)
app.use(BASE_ROUTES.PUBLIC, publicAuctionRoutes)
app.use(BASE_ROUTES.AUCTION_ITEM, auctionItemRoutes)
app.use(BASE_ROUTES.WATCH_LIST, WatchlistRoutes)
app.use(BASE_ROUTES.CHAT, ChatRoutes)
app.use(BASE_ROUTES.BID, BidRoutes)

app.use(errorHandler);
const startServer = async () => {
    await connectDB()
    await connectRedis()
    socketService.initialize(httpServer)
    socketService.setChatService(chatService)
    httpServer.listen(PORT, () => {
        appLogger.info(`your application running on port ${PORT}`)
    })
}
startServer()

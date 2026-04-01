import express, { Application } from "express";
import dotenv from "dotenv"
import { env } from './config/env'
import connectDB from "./config/db";
import cors from 'cors'
import {errorHandler } from "./middlewares/error-handler.middleware";
import { BASE_ROUTES } from "./constants/route.constant";
import authRouter from './routes/auth.router'


dotenv.config()
const app: Application = express()
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const PORT = env.PORT

app.use(BASE_ROUTES.AUTH,authRouter)


app.use(errorHandler);
const startServer = async () => {
    await connectDB()
    app.listen(PORT, () => {
        console.log(`server running on the http://localhost:${PORT}`)
    })
}
startServer()

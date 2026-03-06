import express, { Application } from "express";
import dotenv from "dotenv"
import { env } from './config/env'
import connectDB from "./config/db";
import {errorHandler } from "./middlewares/error-handler.middleware";

dotenv.config()
const app: Application = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const PORT = env.PORT

app.use(errorHandler);
const startServer = async () => {
    await connectDB()
    app.listen(PORT, () => {
        console.log(`server running on the http://localhost:${PORT}`)
    })
}
startServer()

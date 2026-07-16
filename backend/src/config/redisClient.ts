import { createClient } from "redis";
import { env } from '../config/env'

export const redisClient = createClient({
    username: env.REDIS_USER_NAME,
    password: env.REDIS_PASS,
    socket: {
        host: env.REDIS_HOST,
        port: Number(env.REDIS_PORT)
    }
})
redisClient.on('connect', () => {
    console.log('redis connected')
})
redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});



export async function connectRedis() {
    await redisClient.connect()
}
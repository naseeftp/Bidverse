import { env } from "./env";

export const JWT_CONFIG = {
    secret: env.ACCESS_TOKEN_SECRET,
    expiresIn: "5m",
    refreshSecret:env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: "7d"
}
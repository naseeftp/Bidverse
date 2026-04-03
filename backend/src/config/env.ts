import dotenv from "dotenv"
dotenv.config()

export const env = {
    get MONGODB_URI() {
        return process.env.MONGO_URL || ""
    },
    get PORT() {
        return process.env.PORT || "5000"
    },
    get SMTP_HOST(){
        return process.env.SMTP_HOST||""
    },
    get SMTP_PORT(){
        return process.env.SMTP_PORT||""
    },
    get SMTP_USER(){
        return process.env.SMTP_USER||""
    },
    get SMTP_PASS(){
        return process.env.SMTP_PASS||""
    },
    get ACCESS_TOKEN_SECRET(){
        return process.env.ACCESS_TOKEN_SECRET
    },
    get REFRESH_TOKEN_SECRET(){
        return process.env.REFRESH_TOKEN_SECRET
    },
    get NODE_ENV(){
        return process.env.NODE_ENV
    },
    get GOOGLE_CLIENT_ID(){
        return process.env.GOOGLE_CLIENT_ID
    },
    get GOOGLE_CLIENT_SECRET(){
       return process.env.GOOGLE_CLIENT_SECRET
    },
    get GOOGLE_CALLBACK_URL(){
        return process.env.GOOGLE_CALLBACK_URL
    }
}
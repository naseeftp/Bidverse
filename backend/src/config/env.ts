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
    }

}
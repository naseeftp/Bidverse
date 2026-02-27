import dotenv from "dotenv"
dotenv.config()


export const env={
get MONGODB_URI(){
    return process.env.MONGO_URL||""
},
get PORT(){
    return process.env.PORT||"5000"
}


}
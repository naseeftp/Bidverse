import { v2 as cloudinary } from 'cloudinary'; //version 2 api of cloudinary
import { env } from './env'

cloudinary.config({
    cloud_name: env.CLOUDINARY_NAME,
    api_key: env.CLOUDINARY_KEY,
    api_secret: env.CLOUDINARY_SECRET,
    secure: true
})

export default cloudinary
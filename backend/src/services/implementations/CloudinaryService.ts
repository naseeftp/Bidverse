import { UploadAudioResultDTO } from "../../dtos/user.dto/chat.dto";
import { AppError } from "../../errors/AppError";
import { ICloudinaryService } from "../interface/ICloudinary.service";
// import { v2 as cloudinary } from "cloudinary";
import cloudinary from "../../config/cloudinary.config";

export class CloudinaryService implements ICloudinaryService {
    constructor() { }
    async getUploadAudioSignature(fileBuffer: Buffer): Promise<UploadAudioResultDTO> {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'video', // Cloudinary processes audio under 'video'
                    folder: 'chat_voice_notes',
                    format: 'mp3',
                },
                (error, result) => {
                    if (error || !result) {
                        return reject(error || new AppError('Cloudinary upload returned empty result', 500));
                    }
                    resolve({
                        url: result.secure_url,
                        duration: result.duration ?? 0,
                    });
                }
            );

            stream.on('error', (err) => reject(err));
            stream.end(fileBuffer);
        });
    }
}
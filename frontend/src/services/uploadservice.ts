import axiosInstance from "../api/axios.instance";
import { AUCTION_HOUSE_ROUTES } from "../constants/api.constant";
import axios from "axios";
class UploadService {
    async uploadSecurely(file: File): Promise<string> {
        try {
            const response = await axiosInstance.get(AUCTION_HOUSE_ROUTES.GET_UPLOAD_SIGNATURE)
            
            const actualData = response.data.data || response.data
            const { signature, timestamp, folder, cloudName, apiKey } = actualData
            // const { signature, timestamp, folder, cloudName, apiKey } = response.data
            const formData = new FormData()
            formData.append("file", file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp.toString())
            formData.append("signature", signature);
            formData.append("folder", folder);
            const cloudResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                formData
            )
            const result = await cloudResponse.data;
            return result.secure_url

        }
        catch{
            throw new Error("Failed to upload document to cloud storage.");
        }
    }
}

export default new UploadService();
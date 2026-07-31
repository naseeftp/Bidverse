import {UploadAudioResultDTO} from '../../dtos/user.dto/chat.dto'


export interface ICloudinaryService{
    getUploadAudioSignature(fileBuffer:Buffer):Promise<UploadAudioResultDTO>
}
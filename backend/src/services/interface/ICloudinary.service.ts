import {UploadAudioResultDTO} from '../../dtos/user.dto/chat.dto'


export interface ICloudinaryService{
    UploadAudio(fileBuffer:Buffer):Promise<UploadAudioResultDTO>
    UploadImage(fileBuffer:Buffer):Promise<{url:string}>
}
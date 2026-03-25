import { isAxiosError } from "axios";

export const apiErrorHandler=(error:unknown,defaulMessage:string)=>{
 if(isAxiosError(error)){
    return{
        success:false,
        message:error.response?.data?.message||defaulMessage
    }
 }
 return{
    success:false,
    message:error  instanceof Error?error.message:defaulMessage
 }
}
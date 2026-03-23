import { Request,Response,NextFunction } from "express";

export const validator=<T>(validatorFn:(data:T)=>void){
  return(req:Request,res:Response,next:NextFunction)=>{
    try {
        validatorFn(req.body as T) // treat the incoming json data as ur dto
        next()
    } catch (error) {
        next(error)
    }
  }  
}
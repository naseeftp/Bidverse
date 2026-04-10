import { Request,Response,NextFunction } from "express";
import { UnauthorizedError,ForbiddenError } from "../errors/AppError";
import { verifyAccessToken } from "../utils/jwt.utils";
import { MESSAGES } from "../constants/constants";


declare global{
    namespace Express{
        interface Request{
            user:{
                id:string,
                role:string,
                name:string,
                email:string
            }
        }
    }
}

export const protect=async(req:Request,res:Response,next:NextFunction)=>{
  try {
    let token:string|undefined;
    if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer')){
        token=req.headers.authorization.split(' ')[1]
    }
    if(!token){
        throw new UnauthorizedError(MESSAGES.INVALID_ACCESS_TOKEN)
    }
    const decoded=verifyAccessToken(token) as any
    req.user={
        id:decoded.userId,
        role:decoded.role,
        email:decoded.email,
        name:decoded.name
    }
    next()
  } catch (error) {
   return next(new UnauthorizedError(MESSAGES.INVALID_ACCESS_TOKEN))
  }

}

export const restrictTo=(...allowedRoles:string[])=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        if(!req.user){
          return next(new UnauthorizedError('Authentication Required'));
        }
        if(!allowedRoles.includes(req.user.role)){
            return next(`Access denied. Roles allowed: [${allowedRoles.join(', ')}]`)
        }
        next();
    }
}
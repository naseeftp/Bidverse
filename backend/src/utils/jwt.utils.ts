import jwt from "jsonwebtoken";
import { IUserDocument } from '../types/user.type'
import { JWTPayload } from '../types/auth.types'
import { AppError, UnauthorizedError } from "../errors/AppError";
import { HttpStatus, MESSAGES } from "../constants/constants";
import { env } from "../config/env";
import { JWT_CONFIG } from '../config/jwt'


const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET;

export const generateAccessToken = (user: IUserDocument): string => {
    if (!ACCESS_TOKEN_SECRET) {
        throw new AppError(MESSAGES.SERVER_ERROR, HttpStatus.INTERNAL_ERROR)
    }
    const payload: JWTPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        profileImage: user.profileImage || null
    }
    return jwt.sign(payload, ACCESS_TOKEN_SECRET as jwt.Secret, {
        expiresIn: JWT_CONFIG.expiresIn
    } as jwt.SignOptions)
}

export const generateRefreshToken = (user: IUserDocument): String => {
    if (!REFRESH_TOKEN_SECRET) {
        throw new AppError(MESSAGES.SERVER_ERROR, HttpStatus.INTERNAL_ERROR)
    }
    const payload: JWTPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        profileImage: user.profileImage || null
    }
    return jwt.sign(payload, REFRESH_TOKEN_SECRET as jwt.Secret, {
        expiresIn: JWT_CONFIG.refreshExpiresIn
    } as jwt.SignOptions)
}

export const verifyAccessToken = (token: string): JWTPayload => {
    if (!ACCESS_TOKEN_SECRET) {
        throw new AppError(MESSAGES.SERVER_ERROR, HttpStatus.INTERNAL_ERROR)
    }
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload
    } catch (error) {
        throw new UnauthorizedError(MESSAGES.INVALID_ACCESS_TOKEN)
    }
}


export const verifyRefreshToken = (token: string): JWTPayload => {
    if (!REFRESH_TOKEN_SECRET) {
        throw new AppError(MESSAGES.SERVER_ERROR, HttpStatus.INTERNAL_ERROR)
    }
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload
    } catch (error) {
        throw new UnauthorizedError(MESSAGES.INVALID_REFRESH_TOKEN)
    }
}

export const decodeToken = (token: string): JWTPayload | null => {
    try {
        return jwt.decode(token) as JWTPayload;
    } catch (error) {
        return null
    }
}
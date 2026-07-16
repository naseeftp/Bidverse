import { redisClient } from '../../config/redisClient'
import { IOtpRepository } from '../interfaces/IOtp.repository'
import { IOTP } from "../../types/otp.type"
import { randomUUID } from "crypto";

export class RedisOtpRepository implements IOtpRepository {
    async create(data: Partial<IOTP>): Promise<void> {
        if (!data.email || !data.expiresAt) {
            throw new Error("Email and expiry date are required.");
        }
        const ttl = Math.max(
            1,
            Math.floor(
                (new Date(data.expiresAt).getTime() - Date.now()) / 1000
            )
        );
        const otpData = {
            _id: randomUUID(),
            email: data.email,
            otp: data.otp,
            purpose: data.purpose,
            userData: data.userData,
            expiresAt: data.expiresAt,
            createdAt: new Date()
        };

        await redisClient.set(
            `otp:${data.email}`,
            JSON.stringify(otpData),
            {
                EX: ttl
            }
        );
    }

    async findByEmailAndOtp(email: string, otp: string): Promise<IOTP | null> {
        const data = await redisClient.get(`otp:${email}`);
        if (!data) {
            return null;
        }
        const otpRecord = JSON.parse(data) as IOTP;
        if (otpRecord.otp !== otp) {
            return null;
        }
        return otpRecord;
    }
    async findByEmail(email: string): Promise<IOTP | null> {
        const data = await redisClient.get(`otp:${email}`);
        if (!data) {
            return null;
        }
        return JSON.parse(data) as IOTP;
    }
    async updateOtp(email: string, data: { otp: string; expiresAt: Date; }): Promise<void> {
        const existing = await this.findByEmail(email);
        if (!existing) {
            return;
        }
        existing.otp = data.otp;
        existing.expiresAt = data.expiresAt;
        const ttl = Math.max(
            1, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
        await redisClient.set(
            `otp:${email}`,
            JSON.stringify(existing),
            {
                EX: ttl
            }
        );
    }
    async deleteByEmail(email: string): Promise<void> {
        await redisClient.del(`otp:${email}`);
    }

}
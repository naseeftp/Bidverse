import { IOTP } from "../../types/otp.type";
import otpModel from '../../models/otp.model'
import { IOtpRepository } from "../interfaces/IOtp.repository";
import { BaseRepository } from "./Base.repository";

export class OtpRepository extends BaseRepository<IOTP> implements IOtpRepository{
    constructor()
    {
        super(otpModel)
    }
    async findByEmailAndOtp(email: string, otp: string): Promise<IOTP | null> {
        return  await this.model.findOne({email,otp})
    }
}
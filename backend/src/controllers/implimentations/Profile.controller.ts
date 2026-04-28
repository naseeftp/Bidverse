import { IprofileController } from "../interfaces/IProfile.controller";
import { ILoggerService } from "../../services/interface/ILogger.service";
import { IProfileService } from "../../services/interface/IProfile.service";
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";

export class ProfileController implements IprofileController {
    constructor(
        private _profileService: IProfileService,
        private _logger: ILoggerService
    ) { }
    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.user.id as string;
            this._logger.info('getting profile for userid profile controller', { userID: id })
            const result = await this._profileService.getProfileData(id)
            SuccessResponse(
                res,
                MESSAGES.PROFILE_RETRIEVED,
                result,
                HttpStatus.OK
            )
        } catch (error) {
            next(error)
        }
    }
}
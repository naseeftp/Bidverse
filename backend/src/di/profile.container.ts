import { UserRepository } from "../repositories/implementations/User.repository";
import { LoggerService } from "../services/implementations/Logger.service";
import { ProfileService } from "../services/implementations/Profile.service";
import { ProfileController } from "../controllers/implimentations/Profile.controller";

const userRepo = new UserRepository()
const profiServiceleLogger = new LoggerService('ProfileLogger')
const profileService = new ProfileService(userRepo, profiServiceleLogger)
const profileControllerLogger = new LoggerService('profileControllerLogger')
export const profileController = new ProfileController(profileService, profileControllerLogger)

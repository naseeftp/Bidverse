import { BidRepository } from "../repositories/implementations/Bid.repository";
import { UserRepository } from "../repositories/implementations/User.repository";
import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";
import { BidService } from "../services/implementations/Bid.service";
import { BidController } from "../controllers/implimentations/Bid.controller";
import { NotificationService } from "../services/implementations/Notification.service";
import { NotificationRepository } from "../repositories/implementations/NotificationRepository";

const bidrepo = new BidRepository();
const userRepo = new UserRepository();
const auctionRepo = new AuctionItemRepository();
const notificationRepo = new NotificationRepository();
const notificationService = new NotificationService(notificationRepo)
const bidService = new BidService(bidrepo, userRepo, auctionRepo, notificationService);
export const bidController = new BidController(bidService)
import { BidRepository } from "../repositories/implementations/Bid.repository";
import { UserRepository } from "../repositories/implementations/User.repository";
import { AuctionItemRepository } from "../repositories/implementations/AuctionItem.repository";
import { BidService } from "../services/implementations/Bid.service";
import { BidController } from "../controllers/implimentations/Bid.controller";

const bidrepo = new BidRepository();
const userRepo = new UserRepository();
const auctionRepo = new AuctionItemRepository();
const bidService = new BidService(bidrepo, userRepo, auctionRepo);
export const bidController = new BidController(bidService)
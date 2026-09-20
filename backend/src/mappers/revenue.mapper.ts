
import { IncomingRevenueRowDTO } from "../dtos/admin.dto/revenue.dto";
import { TenantIncomingRevenueRowDTO } from "../dtos/auctionHouse.dto/revenue.dto";

interface IIncomingRevenueDoc {
    id: string;
    date: Date;
    source: string;
    auctionTitle?: string;
    houseName?: string;
    amount: number;
    status: string;
}
interface ITenantRevenueDoc {
    id: string;
    date: Date;
    source: string;
    auctionTitle?: string;
    amount: number;
    status: string;
}

export class RevenueMapper {
    static toIncomingRevenueRowDTO(doc: IIncomingRevenueDoc): IncomingRevenueRowDTO {
        return {
            id: doc.id,
            date: doc.date.toISOString(),
            source: doc.source as "order" | "slot_booking" | "unknown",
            auctionTitle: doc.auctionTitle,
            houseName: doc.houseName,
            amount: doc.amount,
            status: doc.status,
        };
    }

    static toIncomingRevenueList(docs: IIncomingRevenueDoc[]): IncomingRevenueRowDTO[] {
        return docs.map(d => this.toIncomingRevenueRowDTO(d));
    }
    static toIncomingTenantRevenueRowDTO(doc: ITenantRevenueDoc): TenantIncomingRevenueRowDTO {
        return {
            id: doc.id,
            date: doc.date.toISOString(),
            source: doc.source as "order" | "slot_booking" | "unknown",
            auctionTitle: doc.auctionTitle,
            amount: doc.amount,
            status: doc.status,
        };
    }

    static toIncomingTenantRevenueList(docs: ITenantRevenueDoc[]): TenantIncomingRevenueRowDTO[] {
        return docs.map(d => this.toIncomingRevenueRowDTO(d));
    }
}
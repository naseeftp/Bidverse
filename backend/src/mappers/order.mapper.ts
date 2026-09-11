import { OrderListResponseDTO, OrderResponseDTO } from "../dtos/user.dto/order.dto";
import { IOrderDocument } from "../types/order.type";

export class OrderMapper {
    static toResponseDTO(doc: IOrderDocument): OrderResponseDTO {
        return {
            id: doc._id.toString(),
            orderNumber: doc.orderNumber,
            auctionItemId: doc.auctionItemId.toString(),
            paymentRequestId: doc.paymentRequestId.toString(),
            tenantId: doc.tenantId.toString(),
            buyerId: doc.buyerId.toString(),
            addressId: doc.addressId.toString(),
            shippingSnapshot: doc.shippingSnapshot,
            itemAmount: doc.itemAmount,
            shippingCost: doc.shippingCost,
            totalAmount: doc.totalAmount,
            currency: doc.currency,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        }
    }
    static toListDTO(doc: IOrderDocument,
        auctionMeta?: { title: string; image?: string }
    ): OrderListResponseDTO {
        return {
         id:doc._id.toString(),
         orderNumber:doc.orderNumber,
         auctionId:doc.auctionItemId.toString(),
         itemImage:auctionMeta?.image,
         itemTitle:auctionMeta?.title,
         orderAmount:doc.totalAmount,
         status:doc.status
        }
    }
}
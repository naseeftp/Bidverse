import { OrderListResponseDTO, OrderResponseDTO,OrderDetailsResponseDTO, OrderTenantListResponseDTO} from "../dtos/user.dto/order.dto";
import { IOrderDocument,IOrderDetailsAggregateDoc,IOrderAggregateDOC,IOrderTenantAggregateDOC } from "../types/order.type";

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
    static toListDTO(doc:IOrderAggregateDOC): OrderListResponseDTO {
        return {
         id:doc._id.toString(),
         orderNumber:doc.orderNumber,
         auctionId:doc.auctionItemId.toString(),
         itemImage:doc.auction?.images?.[0],
         itemTitle:doc.auction?.title,
         orderAmount:doc.totalAmount,
         status:doc.status
        }
    }
       static toTenantOrdersListDTO(doc:IOrderTenantAggregateDOC): OrderTenantListResponseDTO {
        return {
         id:doc._id.toString(),
         orderNumber:doc.orderNumber,
         auctionId:doc.auctionItemId.toString(),
         itemImage:doc.auction?.images?.[0],
         itemTitle:doc.auction?.title,
         buyerName:doc.buyer?.buyerName,
         buyerId:doc.buyer?._id.toString(),
         orderAmount:doc.totalAmount,
         status:doc.status
        }
    }

    static toDetailsDTO(doc: IOrderDetailsAggregateDoc): OrderDetailsResponseDTO {
        let imageUrl: string | null = null;
        if (doc.auction?.images && doc.auction.images.length > 0) {
            const firstImg = doc.auction.images[0];
            imageUrl = typeof firstImg === "string" ? firstImg : firstImg.url;
        }

        return {
            id: doc._id.toString(),
            orderNumber: doc.orderNumber,
            status: doc.status,
            createdAt: doc.createdAt.toISOString(),
            shippedAt: doc.shippedAt ? doc.shippedAt.toISOString() : undefined,
            deliveredAt: doc.deliveredAt ? doc.deliveredAt.toISOString() : undefined,

            item: {
                id: doc.auction?._id?.toString() || "",
                title: doc.auction?.title || "Item details unavailable",
                imageUrl,
            },

            shippingAddress: {
                recipientName: doc.shippingSnapshot.recipientName,
                phone: doc.shippingSnapshot.phone,
                altPhone: doc.shippingSnapshot.altPhone,
                fullAddress: doc.shippingSnapshot.fullAddress,
                pincode: doc.shippingSnapshot.pincode,
                landMark: doc.shippingSnapshot.landMark,
                city: doc.shippingSnapshot.city,
                state: doc.shippingSnapshot.state,
                country: doc.shippingSnapshot.country,
            },

            financials: {
                itemAmount: doc.itemAmount,
                shippingCost: doc.shippingCost,
                totalAmount: doc.totalAmount,
                currency: doc.currency,
            },

            payment: doc.payment
                ? {
                      paymentId: doc.payment._id.toString(),
                      razorpayOrderId: doc.payment.razorpayOrderId,
                      razorpayPaymentId: doc.payment.razorpayPaymentId,
                      status: doc.payment.status,
                      escrowStatus: doc.payment.escrowStatus,
                      type: doc.payment.type,
                      paidAt: doc.payment.paidAt ? doc.payment.paidAt.toISOString() : undefined,
                  }
                : undefined,

            seller: doc.tenant
                ? {
                      id: doc.tenant._id.toString(),
                      name: doc.tenant.name,
                      email: doc.tenant.email,
                  }
                : undefined,
        };
    }
}
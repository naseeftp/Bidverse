import * as yup from 'yup'


export const AuctionItemStatus = {
    DRAFT: 'DRAFT',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    REJECTED: 'REJECTED',
    SCHEDULED: 'SCHEDULED',
    SOLD: 'SOLD',
    PASSED: 'PASSED',
    CANCELLED_BY_HOUSE: 'CANCELLED_BY_HOUSE',
    CANCELLED_BY_ADMIN: 'CANCELLED_BY_ADMIN',
} as const;

export const AuctionType = {
    TIMED: 'TIMED',
    LIVE: 'LIVE'
} as const

export type AuctionItemStatus = typeof AuctionItemStatus[keyof typeof AuctionItemStatus]
export type AuctionType = typeof AuctionType[keyof typeof AuctionType]


export interface AuctionItemResponseDTO {
    id: string;
    houseId: string;
    title: string;
    description: string;
    status: AuctionItemStatus;
    type: AuctionType;
    images: {
        id: string;
        url: string;
        isPrimary: boolean;
        altText?: string;
    }[];
    currency: 'INR';
    startingPrice: number;
    currentHighestBid: number;
    minimumIncrement: number;
    buyerPremiumPercent: number;

    currentHighestBidderId?: string;
    winningBidderId?: string;

    startTime: string;
    endTime: string;
    snipingProtectionMinutes: number;

    cancellation?: {
        cancelledBy: 'HOUSE' | 'ADMIN';
        reason: string;
        cancelledAt: string;
    }
    shippingCost: number;
    shippingTerms: string;
    createdAt: string;
    updatedAt: string;
}

export const createAuctionItemSchema = yup.object({
    title: yup.string()
        .trim()
        .required('Title is required')
        .min(3, 'Title must be at least 3 characters long')
        .max(150, 'Title cannot exceed 150 characters'),

    description: yup.string()
        .trim()
        .required('Description is Required')
        .min(20, 'Provide a descriptive product overview (min 20 characters)')
        .max(2000, 'Description cannot exceed 2000 characters'),

    type: yup.string()
        .oneOf(Object.values(AuctionType), 'Invalid auction type selected')
        .required('Auction type is required'),

    images: yup.array()
        .of(
            yup.object({
                id: yup.string().trim().required('image Id Asset Token is required'),
                url: yup.string()
                   .required('Image URL is required'),
                isPrimary: yup.boolean().default(false),
                altText: yup.string().trim().max(200, 'Alt text too long').optional(),
            })
        )
        .min(1,'upload at least one item photo')
        .required('At least one image is required'),

    startingPrice:yup.number()
    .typeError('Starting price must be a valid number')
    .required('Starting price is required')
    .min(0,'starting price must be begin at ₹0 or more'),

    reservePrice:yup.number()
    .typeError('Reserve price must be a valid number')
    .required('Reserve price is required')
    .min(0,'reserve price cannot be negative')
    .test(
      'reserve-price-gte-starting', //in every custom rule creating by test() must have unique internal name
      'Reserve price cannot be lower than the starting opening price',
      function (value) {
        const { startingPrice } = this.parent;
        return value === undefined || startingPrice === undefined || value >= startingPrice;
      }
    ),

    minimumIncrement: yup.number()
    .typeError('Minimum increment must be a valid number')
    .integer('Minimum bid increment must be a whole number')
    .positive('Minimum increment step must be at least ₹1')
    .required('Minimum increment is required'),

    buyerPremiumPercent: yup.number()
    .typeError('Buyer premium must be a valid number')
    .min(0, 'Buyer premium percentage cannot be negative')
    .max(100, 'Premium margin scale cannot exceed 100%')
    .required('Buyer premium percentage is required'),

    startTime: yup.date()
    .typeError('Invalid start date format')
    .required('Start time is required')
    .test('not-in-past', 'Start time cannot be set in the past', (value) => {
      if (!value) return false;
      const oneMinuteAgo = new Date(Date.now() - 60000);
      return value >= oneMinuteAgo;
    }),

    endTime: yup.date()
    .typeError('Invalid end date format')
    .required('End time is required')
    .test(
      'end-time-after-start',
      'The auction end time must occur after the start timeline has opened',
      function (value) {
        const { startTime } = this.parent;
        return !value || !startTime || value > startTime;
      }
    ),

    snipingProtectionMinutes: yup.number()
    .typeError('Sniping protection must be a valid number')
    .integer('Must be a whole number')
    .min(0, 'Sniping window extension cannot be negative')
    .max(60, 'Sniping protection cannot exceed 60 minutes')
    .required('Sniping protection minutes field is required'),

  shippingCost: yup.number()
    .typeError('Shipping cost must be a valid number')
    .min(0, 'Shipping fees cannot be negative')
    .required('Shipping cost is required'),

  shippingTerms: yup.string()
    .trim()
    .min(5, 'Provide explicit parcel transit/pickup specifications')
    .max(500, 'Shipping notes cannot exceed 500 characters')
    .required('Shipping terms are required'),

})
export interface AuctionItemListDTO{
auctionItemId:string;
auctionHouseId:string;
auctionName:string;
auctionHouseName:string;
auctionStatus:AuctionItemStatus;
type:AuctionType;
 images: {
        id: string;
        url: string;
        isPrimary: boolean;
        altText?: string;
 }[];

}

export type CreateAuctionItemDTO= yup.InferType<typeof createAuctionItemSchema>;


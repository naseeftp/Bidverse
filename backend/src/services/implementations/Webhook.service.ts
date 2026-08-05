import { IStripeWebhookService } from "../interface/IStripeWebhook.service";
import {env} from '../../config/env'
import { stripeClient } from "../../config/stripe.config";
import { AppError } from "../../errors/AppError";

export class StripeWebhookService implements IStripeWebhookService {
 
    async handleStripeWebhook(payload: Buffer, signature: string): Promise<void> {
     let event: ReturnType<typeof stripeClient.webhooks.constructEvent>
     try {
        event=stripeClient.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
     } catch {
        throw new AppError("Invalid Stripe webhook signature");
     }
    }
}
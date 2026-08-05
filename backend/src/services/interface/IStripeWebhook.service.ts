
export interface IStripeWebhookService {
    handleStripeWebhook(payload: Buffer, signature: string): Promise<void>
}
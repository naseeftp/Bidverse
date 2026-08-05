import { StripeWebhookService } from "../services/implementations/Webhook.service";
import { StripeWebHookController } from "../controllers/implimentations/StripeWebhook.controller";


const stripeWebHook=new StripeWebhookService();
const stripeWebhookController=new StripeWebHookController(stripeWebHook)
export default stripeWebhookController
import { IStripeWebhookService } from "../../services/interface/IStripeWebhook.service";
import { Request, Response, NextFunction } from "express";
import { IStripeWebHookController } from "../interfaces/IStripeWebhook.controller";

export class StripeWebHookController implements IStripeWebHookController {
    constructor(
        private _stripeWebhookService: IStripeWebhookService
    ) { }

    async handleStripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this._stripeWebhookService.handleStripeWebhook(
                req.body,
                req.headers["stripe-signature"] as string
            )
             res.sendStatus(200);
        } catch (error) {
            next(error)
        }
    }

}
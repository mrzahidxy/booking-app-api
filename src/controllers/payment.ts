import { Request, Response } from 'express';
import env from '../utils/env';
import { createCheckoutSessionService, handleStripeWebhookEvent } from '../services/payment.service';
export async function createCheckoutSession(req: Request, res: Response) {
    const DOMAIN = env.FRONTEND_DOMAIN ?? 'http://localhost:3000';

    const result = await createCheckoutSessionService(+req.params.id, DOMAIN);
    res.status(result.statusCode).send(result.body);
}



export async function stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    try {
        const event = await handleStripeWebhookEvent(req.body, sig!);
        console.log('event', event);
        res.status(200).send('ok');
    } catch (err: any) {
        console.error("⚠️  Webhook signature verification failed.", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

}

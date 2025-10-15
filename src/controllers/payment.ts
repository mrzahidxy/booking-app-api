import { stripe } from './../config/stripe';
import { Request, Response } from 'express';
import prisma from '../connect';
import Stripe from 'stripe';
export async function createCheckoutSession(req: Request, res: Response) {
    const DOMAIN = process.env.FRONTEND_DOMAIN ?? 'http://localhost:3000';

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
        where: {
            id: +req.params.id
        }
    })

    if (!booking) {
        res.status(404).json({ message: "Booking not found" });
    }

    let amount = 0;
    if (booking?.totalPrice) {
        amount = Math.round(booking?.totalPrice / 120 * 100);
    }

    // Create a Payment Intent
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Booking for ${booking?.id} at ${booking?.createdAt}`,
                    },
                    unit_amount: amount,
                },
                quantity: 1

            },
        ],
        mode: 'payment',
        success_url: `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${DOMAIN}/cancel`,
        metadata: {
            bookingId: booking?.id.toString() as string,    // ← so we can read it later
        },
        client_reference_id: booking?.id.toString(),
    })

    // Create a payment
    await prisma.payment.create({
        data: {
            bookingId: +req.params.id,
            amount: amount,
            currency: "USD",
            status: "PENDING",
            stripeSessionId: session.id
        }
    })

    res.send({
        sessionId: session.id,
    });
}



export async function stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig!,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("⚠️  Webhook signature verification failed.", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        // mark payment as completed
        const payment = await prisma.payment.update({
            where: { stripeSessionId: session.id },
            data: {
                status: "SUCCEEDED",
                stripePaymentIntentId: session.payment_intent as string,
            },
        });

        // Update booking status to "Booked"
        await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: "CONFIRMED" },
        });
    }

    console.log('event', event);
    res.status(200).send('ok');

}



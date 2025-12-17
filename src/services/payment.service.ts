import Stripe from "stripe";
import { getStripe } from "./stripe.service";
import prisma from "../utils/prisma";
import env from "../utils/env";

export const createCheckoutSessionService = async (bookingId: number, domain: string) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    return { statusCode: 404, body: { message: "Booking not found" } };
  }

  let amount = 0;
  if (booking?.totalPrice) {
    amount = Math.round((booking?.totalPrice / 120) * 100);
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Booking for ${booking?.id} at ${booking?.createdAt}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domain}/cancel`,
    metadata: {
      bookingId: booking?.id.toString() as string,
    },
    client_reference_id: booking?.id.toString(),
  });

  await prisma.payment.create({
    data: {
      bookingId,
      amount: amount,
      currency: "USD",
      status: "PENDING",
      stripeSessionId: session.id,
    },
  });

  return {
    statusCode: 200,
    body: {
      sessionId: session.id,
    },
  };
};

export const handleStripeWebhookEvent = async (payload: Buffer, signature: string | string[]) => {
  const stripe = getStripe();
  const event: Stripe.Event = stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const payment = await prisma.payment.update({
      where: { stripeSessionId: session.id },
      data: {
        status: "SUCCEEDED",
        stripePaymentIntentId: session.payment_intent as string,
      },
    });

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    });
  }

  return event;
};

// config/stripe.js

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_PAYMENT_SECRET_KEY as string);


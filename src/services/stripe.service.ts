import Stripe from "stripe";
import env from "../utils/env";

let stripeClient: Stripe | null = null;

export const getStripe = () => {
  if (stripeClient) return stripeClient;
  stripeClient = new Stripe(env.STRIPE_PAYMENT_SECRET_KEY);
  return stripeClient;
};

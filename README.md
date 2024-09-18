# Stripe Multi-Environment Webhook Handler (SMEWH) 🌍💳

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/adshrc/stripe-multi-environment-webhook-handler)

Struggling to handle dev, staging, demo, and other environments with a single Stripe Test Environment? Here's an easy and flexible solution!

This Cloudflare Worker forwards incoming Stripe webhook events to the appropriate environment based on the `returnUrl` included in the event's `metadata` property.

## Requirements

- Create the Cloudflare Worker
- Create a Webhook in your Stripe Dashboard: https://dashboard.stripe.com/test/webhooks

**IMPORTANT: You need to include the target path: `https://<workerDomain>/<targetPath>`**
- Add the `returnUrl` property in the `metadata` of every Stripe request your server sends. It should be the URL of the originating server.

## Example

1. Stripe sends a webhook event to your Worker, e.g. `https://smewh.worker.dev/payment-processors/stripe/webhook-direct`
2. The Worker extracts the `returnUrl` from `metadata.returnUrl` (e.g., `https://your-env.com`)
3. The Worker forwards the original request (including the `stripe-signature` header for validation) to `https://your-env.com/payment-processors/stripe/webhook-direct`
4. The Worker returns the response back to Stripe

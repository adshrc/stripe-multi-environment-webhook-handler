# Stripe Multi-Environment Webhook Handler (SMEWH) 🌍💳

Struggling to handle dev, staging, demo, and other environments with a single Stripe Test Environment? Here's an easy and flexible solution!

This Cloudflare Worker forwards incoming Stripe webhook events to the appropriate environment based on the `returnUrl` included in the event's `metadata` property.

## Requirements

- Create the Cloudflare Worker and upload the `worker.js` contents or use this Button:

  [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/adshrc/stripe-multi-environment-webhook-handler)
- Create a Webhook in your Stripe Dashboard: https://dashboard.stripe.com/test/webhooks. Make sure to replace the original URL's Domain with the Worker Domain. In the end you should have something like this: `https://smewh.worker.dev/<originalPath>`

- Add the `returnUrl` property in the `metadata` of every Stripe request your Server sends. It should be the URL of the originating server (e.g. `https://dev.your-server.com`)

## What the Worker actually does

Stripe sends a webhook event to your Worker, e.g. `https://smewh.worker.dev/stripe/webhook`, then the Worker:

1. Parses the body, extracts `metadata.returnUrl` (e.g. `https://dev.your-server.com`)
2. Forwards the original request (including headers!) to `https://dev.your-server.com/stripe/webhook`
3. Returns the response back to Stripe

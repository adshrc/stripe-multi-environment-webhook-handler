# Stripe Multi-Environment Webhook Handler (SMEWH) 🌍💳

Struggling to handle dev, staging, demo, and other environments with a single Stripe Test Environment? Here's an easy and flexible solution!

This Cloudflare Worker forwards incoming Stripe webhook events to the appropriate environment based on the `returnUrl` included in the event's `metadata` property.

## Requirements

- Create the Cloudflare Worker and upload the `worker.js` contents or use this Button:

  [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/adshrc/stripe-multi-environment-webhook-handler)
  
- Create a Webhook in your Stripe Dashboard: https://dashboard.stripe.com/test/webhooks. Make sure to replace the original URL's Domain with the Worker Domain. In the end, you should have something like this: `https://smewh.worker.dev/<originalPath>`

- Add the `returnUrl` property in the `metadata` of every Stripe request your Server sends. It should be the URL of the originating server (e.g. `https://dev.your-server.com`)

- **Optional: Cloudflare Access Environment Variables**
  - `CF_ACCESS_CLIENT_ID`: Set this environment variable if your forwarded requests require authentication with `CF-Access-Client-Id`. 
  - `CF_ACCESS_CLIENT_SECRET`: Set this environment variable if your forwarded requests require authentication with `CF-Access-Client-Secret`.
  - **Note:** Both environment variables must be set for the headers to be added to the forwarded request.

## What the Worker Actually Does

Stripe sends a webhook event to your Worker, e.g., `https://smewh.worker.dev/stripe/webhook`, then the Worker:

1. Parses the body, extracts `metadata.returnUrl` (e.g., `https://dev.your-server.com`).
2. Appends the original request path to the `returnUrl`, forming the `targetUrl`.
3. Checks if the request is from an allowed IP address; if not, it denies access.
4. Adds `CF-Access-Client-Id` and `CF-Access-Client-Secret` headers if both environment variables are set.
5. Forwards the original request (including headers) to the `targetUrl` (e.g., `https://dev.your-server.com/stripe/webhook`).
6. Returns the response back to Stripe.

## Security Considerations

- **IP Filtering**: The Worker only allows incoming requests from specific IP addresses to prevent unauthorized access.
- **Environment Variables**: If `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` are set, they are used to add authentication headers to the forwarded request.
  
Ensure you have the correct IP addresses and environment variables set to match your security requirements.

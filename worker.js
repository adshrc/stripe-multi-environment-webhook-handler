/**
 * Stripe Multi Environment Webhook Handler (SMEWH)
 * 
 * What it does:
 * 1. Stripe sends a Webhook Event to this Cloudflare Worker.
 * 2. The Worker extracts the `returnUrl` from the `metadata` object in the payload.
 * 3. The Worker appends the original request path to the `returnUrl` which is the `targetUrl`.
 * 4. The Worker forwards the request to the `targetUrl` and returns it's response back to Stripe.
 *
 * HTTP Response Codes:
 * - <targetStatusCode>
 * - 202 Accepted: Returned if `returnUrl` is missing or if an error occurs.
 * - 405 Method Not Allowed: Returned for non-POST requests.
 */

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response('Only POST requests allowed', { status: 405 });
    }

    try {
      // Clone the request before reading its body, otherwise the Worker will throw an Exception when sending it below
      const requestClone = request.clone();
      const requestBody = await request.json();
      const returnUrl = requestBody.data?.object?.metadata?.returnUrl;

      // Return a 202 if returnUrl is missing to prevent Stripe retries (it will never succeed)
      if (!returnUrl) {
        return new Response('Event was discarded because it lacks a returnUrl in metadata', { status: 202 });
      }

      const originalPath = new URL(request.url).pathname;
      const targetUrl = returnUrl + originalPath;

      // Return the response from the target server back to Stripe
      return fetch(targetUrl, requestClone);

    } catch (error) {
      // Return a 202 to prevent retries in case of an error
      return new Response('Event was discarded because of a processing error', { status: 202 });
    }
  }
};

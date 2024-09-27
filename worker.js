/**
 * Stripe Multi Environment Webhook Handler (SMEWH)
 * 
 * What it does:
 * 1. Stripe sends a Webhook Event to this Cloudflare Worker.
 * 2. The Worker checks if the request comes from an allowed IP address.
 * 3. The Worker extracts the `returnUrl` from the `metadata` object in the payload.
 * 4. The Worker appends the original request path to the `returnUrl`, forming the `targetUrl`.
 * 5. If the environment variables `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` are set, the Worker adds these as headers to the request.
 * 6. The Worker forwards the request to the `targetUrl` and returns its response back to Stripe.
 *
 * HTTP Response Codes:
 * - <targetStatusCode>: The status code returned from the `targetUrl`.
 * - 202 Accepted: Returned if `returnUrl` is missing, if an error occurs, or if access is denied due to IP filtering.
 * - 403 Forbidden: Returned if the request comes from a non-allowed IP address.
 * - 405 Method Not Allowed: Returned for non-POST requests.
 */

export default {
  async fetch(request, env) {
    // Stripe Webhook IPs (https://stripe.com/files/ips/ips_webhooks.txt)
    const allowedIPs = [
      '3.18.12.63',
      '3.130.192.231',
      '13.235.14.237',
      '13.235.122.149',
      '18.211.135.69',
      '35.154.171.200',
      '52.15.183.38',
      '54.88.130.119',
      '54.88.130.237',
      '54.187.174.169',
      '54.187.205.235',
      '54.187.216.72',
    ];

    // Check if the request IP is allowed
    const clientIP = request.headers.get('cf-connecting-ip');
    if (!allowedIPs.includes(clientIP)) {
      return new Response('Access denied', { status: 403 });
    }

    // Check if the request method is POST
    if (request.method !== 'POST') {
      return new Response('Only POST requests allowed', { status: 405 });
    }

    try {
      // Clone the request before reading its body
      const requestClone = request.clone();
      const requestBody = await request.json();
      const returnUrl = requestBody.data?.object?.metadata?.returnUrl;

      // Return a 202 if returnUrl is missing
      if (!returnUrl) {
        return new Response('Event was discarded because it lacks a returnUrl in metadata', { status: 202 });
      }

      const originalPath = new URL(request.url).pathname;
      const targetUrl = returnUrl + originalPath;

      // Prepare headers for the forwarded request
      const headers = new Headers(requestClone.headers);
      
      // Check if both environment variables are set and add headers if they are
      const clientId = env.CF_ACCESS_CLIENT_ID;
      const clientSecret = env.CF_ACCESS_CLIENT_SECRET;

      if (clientId && clientSecret) {
        headers.set('CF-Access-Client-Id', clientId);
        headers.set('CF-Access-Client-Secret', clientSecret);
      }

      // Forward the modified request with the appended headers
      const modifiedRequest = new Request(targetUrl, {
        method: requestClone.method,
        headers: headers,
        body: requestClone.body,
        redirect: 'follow',
      });

      // Forward the request and return the response back to Stripe
      return fetch(modifiedRequest);

    } catch (error) {
      // Return a 202 to prevent retries in case of an error
      return new Response('Event was discarded because of a processing error', { status: 202 });
    }
  },
};


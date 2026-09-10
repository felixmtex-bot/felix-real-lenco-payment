export async function POST(req) {
  const body = await req.json();
  console.log("Lenco Webhook REAL payment confirmed:", body);

  // Lenco sends reference and status
  const { reference, status, amount } = body;
  if (status !== 'successful' && body.data?.status !== 'successful') {
    return Response.json({ received: true, skipped: 'not successful' });
  }

  // Get Shopify token - use your env vars
  let shopifyToken = process.env.SHOPIFY_ADMIN_TOKEN;
  const store = process.env.SHOPIFY_STORE_DOMAIN; // e.g. felix-xxxx.myshopify.com
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  // If no shpat, try to get via Client ID/Secret (for custom app reinstall flow)
  if (!shopifyToken && clientId && clientSecret) {
    try {
      const tokenRes = await fetch(`https://${store}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials'
        })
      });
      const tokenData = await tokenRes.json();
      shopifyToken = tokenData.access_token;
      console.log("Generated Shopify token:", !!shopifyToken);
    } catch(e) {
      console.error("Token gen failed, need manual shpat", e);
    }
  }

  // If still no token, log error - you need to get shpat from Shopify
  if (!shopifyToken) {
    console.error("MISSING SHOPIFY_ADMIN_TOKEN - Go to Shopify > Apps > Develop Apps > Felix Lenco > Install > Reveal token and add to Vercel as SHOPIFY_ADMIN_TOKEN");
    return Response.json({ received: true, error: "No Shopify token" });
  }

  // TODO: Extract order ID from reference
  // For now we search recent orders and mark the latest unpaid as paid
  // Better: Make reference = ORDER_ID-FG-xxxxx in your frontend
  try {
    // Example: Mark order paid via Shopify API
    // You need to pass order_id from frontend in reference like FG-{orderId}-{time}
    const orderIdFromRef = reference?.split('-')[1] || reference?.split('FG')[1];
    
    if (orderIdFromRef) {
      const shopifyRes = await fetch(`https://${store}/admin/api/2024-01/orders/${orderIdFromRef}/transactions.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': shopifyToken
        },
        body: JSON.stringify({
          transaction: {
            kind: "capture",
            status: "success",
            amount: amount
          }
        })
      });
      const result = await shopifyRes.json();
      console.log("Shopify marked paid:", result);
    }
  } catch (e) {
    console.error("Shopify update failed:", e.message);
  }

  return Response.json({ received: true });
}

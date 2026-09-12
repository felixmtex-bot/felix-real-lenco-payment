export async function POST(req) {
  const body = await req.json();
  const { method, amount, phone, card, email } = body;
  const secret = process.env.LENCO_SECRET_KEY;
  const PAYMENT_LINK = process.env.LENCO_PAYMENT_LINK || "https://pay.lenco.co/YOUR_LINK_HERE"; // Set in Vercel env if you have static link

  if (!secret) {
    return Response.json({ success: false, error: "LENCO_SECRET_KEY not set in Vercel" }, { status: 500 });
  }

  try {
    // UNIFIED ENDPOINT - Lenco Collections (supports mobile + card via hosted checkout)
    // This avoids PCI encryption issue by using Lenco's hosted page for card
    const reference = "FG" + Date.now().toString().slice(-8);
    
    // For Mobile Money - direct collect (no encryption needed)
    if (method === "mtn" || method === "airtel" || method === "zamtel" || method === "mobile") {
      const lencoRes = await fetch("https://api.lenco.co/access/v2/collections/mobile-money", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
        body: JSON.stringify({
          amount: String(amount),
          currency: "ZMW",
          reference,
          phone: phone,
          email: email || "customer@felixglobalstore.com",
          provider: method === "mtn" ? "mtn" : method === "airtel" ? "airtel" : "zamtel",
        }),
      });
      const data = await lencoRes.json();
      if (lencoRes.ok) {
        return Response.json({ success: true, ref: reference, message: `PIN sent to ${phone} - Enter PIN to pay K${amount}`, raw: data });
      } else {
        // If mobile endpoint fails, fallback to hosted checkout link which supports both
        return Response.json({ checkout_url: `${PAYMENT_LINK}?amount=${amount}&reference=${reference}&email=${email || "customer@felixglobalstore.com"}`, ref: reference });
      }
    }

    // For Card - use hosted checkout (Lenco handles 3DS, no PCI needed)
    // If you want direct card charge, you need JWE encryption with jose - we fallback to hosted
    const checkoutRes = await fetch("https://api.lenco.co/access/v2/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({
        amount: String(amount),
        currency: "ZMW",
        reference,
        email: email || card?.email || "customer@felixglobalstore.com",
        redirectUrl: `https://felix-real-lenco-payment.vercel.app/success?ref=${reference}`,
        bearer: "customer",
        description: `Felix Global Store - Order ${reference}`,
      }),
    });

    const checkoutData = await checkoutRes.json();
    console.log("Lenco checkout:", JSON.stringify(checkoutData));

    const url = checkoutData?.data?.checkoutUrl || checkoutData?.data?.link || checkoutData?.checkout_url || checkoutData?.data?.meta?.authorization?.redirect || `${PAYMENT_LINK}?amount=${amount}&reference=${reference}`;

    if (url) {
      return Response.json({ checkout_url: url, ref: reference, raw: checkoutData });
    }

    return Response.json({ success: false, error: checkoutData?.message || "No checkout URL", raw: checkoutData }, { status: 400 });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

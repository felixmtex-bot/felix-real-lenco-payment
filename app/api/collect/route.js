export async function POST(req) {
  const body = await req.json();
  const { method, amount, phone, card, email } = body;
  const secret = process.env.LENCO_SECRET_KEY;
  const PAYMENT_LINK = process.env.LENCO_PAYMENT_LINK; // MUST be set in Vercel!

  if (!secret) {
    return Response.json({ success: false, error: "LENCO_SECRET_KEY not set" }, { status: 500 });
  }

  try {
    const reference = "FG" + Date.now().toString().slice(-8);
    const customerEmail = email || card?.email || "felixmtex@gmail.com";

    // MOBILE MONEY - direct
    if (method === "mtn" || method === "airtel" || method === "zamtel") {
      const lencoRes = await fetch("https://api.lenco.co/access/v2/collections/mobile-money", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
        body: JSON.stringify({
          amount: String(amount),
          currency: "ZMW",
          reference,
          phone: phone,
          email: customerEmail,
          provider: method,
        }),
      });
      const data = await lencoRes.json();
      console.log("Mobile response:", data);
      if (lencoRes.ok && !data.error) {
        return Response.json({ success: true, ref: reference, message: `PIN sent to ${phone} - Enter PIN to pay K${amount}`, raw: data });
      }
      // If mobile direct fails, try hosted checkout fallback
    }

    // CARD + FALLBACK - Use Lenco Payment Link API to generate real checkout URL
    // Step 1: Try to create collection via API
    const checkoutRes = await fetch("https://api.lenco.co/access/v2/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({
        amount: String(amount),
        currency: "ZMW",
        reference,
        email: customerEmail,
        description: `Felix Global Store Order ${reference}`,
        redirectUrl: `https://felix-real-lenco-payment.vercel.app/success?ref=${reference}&amount=${amount}`,
        bearer: "customer",
      }),
    });

    const checkoutData = await checkoutRes.json();
    console.log("Checkout response:", JSON.stringify(checkoutData));

    // Lenco returns checkoutUrl in many places
    let url = checkoutData?.data?.checkoutUrl || checkoutData?.data?.link || checkoutData?.data?.authorization?.redirect || checkoutData?.data?.meta?.authorization?.redirect || checkoutData?.checkout_url;

    // Step 2: If API didn't give URL, use YOUR real payment link from env
    if (!url && PAYMENT_LINK && !PAYMENT_LINK.includes("YOUR_LINK_HERE")) {
      url = `${PAYMENT_LINK}?amount=${amount}&reference=${reference}&email=${encodeURIComponent(customerEmail)}`;
    }

    if (url) {
      return Response.json({ checkout_url: url, ref: reference, raw: checkoutData });
    }

    // If still no URL, return error with instructions
    return Response.json({ 
      success: false, 
      error: "No checkout URL generated. Go to Lenco Dashboard > Payment Links > Create Link, copy link, and add it to Vercel env LENCO_PAYMENT_LINK. Or check Lenco logs.",
      raw: checkoutData 
    }, { status: 400 });

  } catch (e) {
    console.error(e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

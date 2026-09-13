export async function POST(req) {
  const body = await req.json();
  const { method, amount, phone, card, email } = body;
  const secret = process.env.LENCO_SECRET_KEY;

  if (!secret) {
    return Response.json({ success: false, error: "LENCO_SECRET_KEY not set in Vercel" }, { status: 500 });
  }

  try {
    const reference = "FG" + Date.now().toString().slice(-8);
    const customerEmail = email || card?.email || "felixmtex@gmail.com";
    const cleanPhone = phone ? phone.replace(/\s+/g, "") : "";

    console.log(`Processing ${method} for ${amount} phone:${cleanPhone}`);

    // === MOBILE MONEY - Zambia direct PIN flow (NO checkout URL) ===
    if (method === "mtn" || method === "airtel" || method === "zamtel") {
      // Format phone to 260 format for Lenco
      let formattedPhone = cleanPhone;
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "260" + formattedPhone.slice(1);
      }
      if (!formattedPhone.startsWith("260")) {
        formattedPhone = "260" + formattedPhone;
      }

      const lencoBody = {
        amount: String(amount),
        currency: "ZMW",
        reference,
        phone: formattedPhone,
        email: customerEmail,
        provider: method,
      };

      console.log("Calling Lenco mobile-money:", JSON.stringify(lencoBody));

      const lencoRes = await fetch("https://api.lenco.co/access/v2/collections/mobile-money", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${secret}` 
        },
        body: JSON.stringify(lencoBody),
      });

      const data = await lencoRes.json();
      console.log("Lenco mobile-money response:", JSON.stringify(data));

      if (lencoRes.ok && (data.success !== false)) {
        // Success - PIN sent
        return Response.json({ 
          success: true, 
          ref: reference, 
          message: `PIN prompt sent to ${phone}. Check your phone and enter PIN to pay K${amount}.`,
          raw: data 
        });
      } else {
        // Lenco error - show it
        return Response.json({ 
          success: false, 
          error: data.message || data.error || "Lenco mobile money failed",
          raw: data 
        }, { status: 400 });
      }
    }

    // === CARD / VISA - Try to create collection and get checkout URL ===
    // For Zambia, Lenco returns a collection that can be paid via pay.lenco.co
    const checkoutRes = await fetch("https://api.lenco.co/access/v2/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({
        amount: String(amount),
        currency: "ZMW",
        reference,
        email: customerEmail,
        description: `Felix Global Store ${reference}`,
        redirectUrl: `https://felix-real-lenco-payment.vercel.app/success?ref=${reference}&amount=${amount}`,
      }),
    });

    const checkoutData = await checkoutRes.json();
    console.log("Checkout response:", JSON.stringify(checkoutData));

    // Try to find URL in many possible fields
    let url = checkoutData?.data?.checkoutUrl || 
              checkoutData?.data?.link || 
              checkoutData?.data?.authorization?.redirect ||
              checkoutData?.data?.hostedUrl ||
              checkoutData?.checkoutUrl;

    // If Lenco Zambia returns ID, build pay link: pay.lenco.co/collect/{id}
    if (!url && checkoutData?.data?.id) {
      url = `https://pay.lenco.co/collect/${checkoutData.data.id}`;
    }
    if (!url && checkoutData?.data?.collectionId) {
      url = `https://pay.lenco.co/collect/${checkoutData.data.collectionId}`;
    }

    if (url) {
      return Response.json({ checkout_url: url, ref: reference, raw: checkoutData });
    }

    // If card fails, suggest mobile money (Zambia cards often not enabled)
    return Response.json({ 
      success: false, 
      error: checkoutData?.message || "Card not enabled for Zambia. Please use MTN/Airtel/Zamtel for instant payment. If you need Visa, contact Lenco to enable card collections.",
      raw: checkoutData 
    }, { status: 400 });

  } catch (e) {
    console.error("Route error:", e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

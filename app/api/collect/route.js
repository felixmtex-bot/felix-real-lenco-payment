export async function POST(req) {
  const body = await req.json();
  const { method, amount, phone, email } = body;
  const secret = process.env.LENCO_SECRET_KEY;

  if (!secret) {
    return Response.json({ success: false, error: "LENCO_SECRET_KEY not set" }, { status: 500 });
  }

  try {
    const reference = "FG" + Date.now().toString().slice(-8);
    const customerEmail = email || "felixmtex@gmail.com";
    const cleanPhone = phone ? phone.replace(/\s+/g, "").replace(/^0/, "260") : "";
    const finalPhone = cleanPhone.startsWith("260") ? cleanPhone : `260${cleanPhone}`;

    console.log(`Zambia FIX: ${method} amount ${amount} phone ${finalPhone} ref ${reference}`);

    // For ALL methods - create Lenco collection, get hosted checkout URL
    // This lets Lenco's own page detect MTN/Airtel/Zamtel correctly
    const res = await fetch("https://api.lenco.co/access/v2/collections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secret}`
      },
      body: JSON.stringify({
        amount: String(amount),
        currency: "ZMW",
        reference,
        email: customerEmail,
        phone: finalPhone,
        description: `Felix Global Store Order ${reference} - ${method.toUpperCase()} ZMW ${amount}`,
        redirectUrl: `https://felix-real-lenco-payment.vercel.app/success?ref=${reference}&amount=${amount}`,
        bearer: "customer",
      })
    });

    const data = await res.json();
    console.log("Lenco collections response:", JSON.stringify(data, null, 2));

    // Extract checkout URL from many possible locations
    let url = data?.data?.checkoutUrl || 
              data?.data?.link || 
              data?.data?.hostedUrl ||
              data?.data?.authorization?.redirect ||
              data?.data?.meta?.authorization?.redirect ||
              data?.checkoutUrl;

    // If only ID returned, build pay link
    if (!url && data?.data?.id) {
      url = `https://pay.lenco.co/collect/${data.data.id}`;
    }
    if (!url && data?.data?._id) {
      url = `https://pay.lenco.co/collect/${data.data._id}`;
    }
    if (!url && data?.data?.collectionId) {
      url = `https://pay.lenco.co/collect/${data.data.collectionId}`;
    }

    if (url) {
      return Response.json({ 
        checkout_url: url, 
        ref: reference,
        raw: data 
      });
    }

    // If Lenco returned error
    return Response.json({ 
      success: false, 
      error: data?.message || data?.error || "Lenco failed to create checkout. Check Lenco dashboard: Collections > Enable Mobile Money.",
      raw: data 
    }, { status: 400 });

  } catch (e) {
    console.error("Route error:", e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  const body = await req.json();
  const { amount, phone, method } = body;
  const secret = process.env.LENCO_SECRET_KEY;
  const reference = "FG" + Date.now().toString().slice(-8);
  let cleanPhone = phone?.replace(/\s+/g, "") || "";
  if (cleanPhone.startsWith("0")) cleanPhone = "260" + cleanPhone.slice(1);
  if (!cleanPhone.startsWith("260") && cleanPhone.length >= 9) cleanPhone = "260" + cleanPhone;

  console.log("=== ZAMBIA DEBUG ===", { method, amount, cleanPhone, reference, secretPresent: !!secret });

  const payload = {
    amount: String(amount),
    currency: "ZMW",
    reference,
    phone: cleanPhone,
    email: "felixmtex@gmail.com",
    description: `Felix Order ${reference}`,
    redirectUrl: `https://felix-real-lenco-payment.vercel.app/success?ref=${reference}`,
  };

  try {
    const res = await fetch("https://api.lenco.co/access/v2/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${secret}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("LENCO RAW:", JSON.stringify(data), "STATUS", res.status);

    return Response.json({
      debug: true,
      http_status: res.status,
      lenco_response: data,
      sent_data: payload,
      secret_present: !!secret,
      reference
    });
  } catch (e) {
    console.log("FETCH ERROR", e.message);
    return Response.json({ debug: true, fetch_error: e.message, sent_data: payload });
  }
}

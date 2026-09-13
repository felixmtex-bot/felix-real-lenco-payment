export async function POST(req) {
  const body = await req.json();
  const { amount, phone, method } = body;
  const secret = process.env.LENCO_SECRET_KEY;
  const reference = "FG" + Date.now().toString().slice(-8);
  
  // Format phone for Zambia API: needs 260... and operator lower case
  let cleanPhone = phone?.replace(/\s+/g, "") || "";
  if (cleanPhone.startsWith("0")) cleanPhone = "260" + cleanPhone.slice(1);
  if (!cleanPhone.startsWith("260")) cleanPhone = "260" + cleanPhone;
  
  // Map your method to Lenco operator - YOUR CORRECT MAPPING
  let operator = "airtel";
  if (method?.toLowerCase().includes("mtn")) operator = "mtn";
  else if (method?.toLowerCase().includes("airtel")) operator = "airtel";
  else if (method?.toLowerCase().includes("zamtel")) operator = "zamtel";
  else {
    // Auto-detect from prefix - YOUR PREFIXES:
    // 077, 097, 079 = Airtel
    // 076, 096, 056 = MTN
    // 095, 055 = Zamtel
    const prefix = cleanPhone.slice(-9, -7) || cleanPhone.slice(3,5);
    const fullPrefix = cleanPhone.slice(3,6); // e.g., 077, 076
    if (["076","096","056"].includes(fullPrefix)) operator = "mtn";
    else if (["077","097","079"].includes(fullPrefix)) operator = "airtel";
    else if (["095","055"].includes(fullPrefix)) operator = "zamtel";
  }

  console.log(`ZAMBIA CORRECT: ${cleanPhone} -> ${operator} amount ${amount} ref ${reference}`);

  // FOR MOBILE MONEY - Use correct Lenco endpoint
  if (["mtn","airtel","zamtel"].includes(operator)) {
    try {
      const res = await fetch("https://api.lenco.co/access/v2/collections/mobile-money", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secret}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          amount: Number(amount),
          reference: reference,
          phone: cleanPhone,
          operator: operator,
          country: "zm",
          bearer: "customer"
        })
      });
      
      const data = await res.json();
      console.log("Lenco mobile-money response:", JSON.stringify(data), "status", res.status);
      
      if (res.ok && data?.status === true) {
        // Success! Status will be pay-offline - customer must approve on phone
        return Response.json({
          success: true,
          message: `PIN prompt sent to ${cleanPhone} (${operator.toUpperCase()} Zambia). Check your phone to enter PIN!`,
          reference: reference,
          lenco_id: data?.data?.id,
          operator: operator,
          status: data?.data?.status // pay-offline
        });
      } else {
        return Response.json({
          success: false,
          error: data?.message || `Lenco error: ${JSON.stringify(data)}`,
          raw: data,
          sent: { amount, phone: cleanPhone, operator, country: "zm" },
          http_status: res.status
        }, { status: 400 });
      }
    } catch (e) {
      return Response.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  // FOR VISA/CARD - Use hosted collection
  try {
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
        email: "felixmtex@gmail.com",
        description: `Felix Order ${reference}`,
        redirectUrl: `https://felix-real-lenco-payment.vercel.app/success?ref=${reference}`
      })
    });
    const data = await res.json();
    let url = data?.data?.checkoutUrl || data?.data?.link || (data?.data?.id ? `https://pay.lenco.co/collect/${data.data.id}` : null);
    if (url) return Response.json({ checkout_url: url, ref: reference });
    return Response.json({ success: false, error: data?.message || "Failed", raw: data }, { status: 400 });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

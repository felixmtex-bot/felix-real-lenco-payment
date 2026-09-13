export async function POST(req) {
  const body = await req.json();
  const { amount, phone, method } = body;
  const secret = process.env.LENCO_SECRET_KEY;
  const reference = "FG" + Date.now().toString().slice(-8);
  
  let cleanPhone = phone?.replace(/\s+/g, "") || "";
  if (cleanPhone.startsWith("0")) cleanPhone = "260" + cleanPhone.slice(1);
  if (!cleanPhone.startsWith("260") && cleanPhone.length >= 9) cleanPhone = "260" + cleanPhone;

  // YOUR PREFIXES: 077/097/079=Airtel, 076/096/056=MTN, 095/055=Zamtel
  let operator = "airtel";
  const pre = cleanPhone.slice(3,6);
  if (["076","096","056"].includes(pre)) operator = "mtn";
  else if (["077","097","079"].includes(pre)) operator = "airtel";
  else if (["095","055"].includes(pre)) operator = "zamtel";
  if (method?.toLowerCase().includes("mtn")) operator = "mtn";
  if (method?.toLowerCase().includes("airtel")) operator = "airtel";
  if (method?.toLowerCase().includes("zamtel")) operator = "zamtel";

  console.log(`INITIATE REAL: ${cleanPhone} ${operator} ZMW ${amount} ${reference}`);

  try {
    const res = await fetch("https://api.lenco.co/access/v2/collections/mobile-money", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${secret}`, "Accept": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        reference,
        phone: cleanPhone,
        operator,
        country: "zm",
        bearer: "customer"
      })
    });
    const data = await res.json();
    console.log("Lenco initiate:", JSON.stringify(data));

    if (data?.status === true && data?.data?.id) {
      return Response.json({
        success: true,
        collection_id: data.data.id,
        reference,
        operator,
        phone: cleanPhone,
        status: data.data.status,
        amount,
        message: "PIN sent - waiting for Lenco confirmation"
      });
    } else {
      return Response.json({ success: false, error: data?.message || "Init failed", raw: data }, { status: 400 });
    }
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

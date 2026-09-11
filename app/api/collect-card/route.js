import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { amount } = await req.json();
    const secret = process.env.LENCO_SECRET_KEY;

    // Create Lenco Checkout that supports BOTH Mobile + Visa
    const res = await fetch("https://api.lenco.co/access/v2/collections", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: String(amount),
        currency: "ZMW",
        reference: `FG-${Date.now()}`,
        email: "felixmtex@gmail.com", // customer email
        // This tells Lenco to accept cards + mobile money on their hosted page
        redirectUrl: "https://felix-real-lenco-payment.vercel.app/success",
      }),
    });

    const data = await res.json();
    console.log("Lenco Checkout:", data);

    if (!res.ok) {
      return NextResponse.json({ error: data.message, raw: data }, { status: 400 });
    }

    // Lenco returns checkout_url or authorization redirect
    const checkoutUrl = data.data?.meta?.authorization?.redirect || data.data?.checkoutUrl || data.checkout_url;

    return NextResponse.json({ checkout_url: checkoutUrl, raw: data });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

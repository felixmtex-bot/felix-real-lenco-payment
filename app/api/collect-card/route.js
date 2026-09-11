import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { amount, card } = await req.json();
    const secret = process.env.LENCO_SECRET_KEY;

    if (!secret) {
      return NextResponse.json({ error: "LENCO_SECRET_KEY missing" }, { status: 500 });
    }

    const res = await fetch("https://api.lenco.co/api/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Number(amount),
        currency: "ZMW",
        type: "card",
        card: {
          number: card.number.replace(/\s/g, ""),
          exp_month: card.exp.split("/")[0],
          exp_year: "20" + card.exp.split("/")[1].slice(-2),
          cvv: card.cvv,
          name: card.name,
          email: card.email,
        },
        reference: `FG-${Date.now()}`,
        description: "Felix Global Store",
      }),
    });

    const data = await res.json();
    console.log("Lenco:", data);

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Card failed", raw: data }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

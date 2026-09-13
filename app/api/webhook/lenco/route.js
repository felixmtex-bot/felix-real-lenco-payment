export async function POST(req) {
  try {
    const body = await req.json();
    console.log("=== LENCO WEBHOOK RECEIVED ===", JSON.stringify(body, null, 2));

    // Lenco sends: data.status = successful / failed, data.reference = FG...
    const data = body?.data || body;
    const status = data?.status?.toLowerCase();
    const reference = data?.reference;
    const amount = data?.amount;
    const lencoRef = data?.lencoReference || data?.id;

    console.log(`Webhook: ${reference} -> ${status} ZMW ${amount}`);

    // Here you can save to database, send email, update order
    // For now, we just log - status check API will query Lenco directly for real status

    // Return 200 to Lenco so they know we received it
    return Response.json({ received: true, reference, status });

  } catch (e) {
    console.error("Webhook error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ status: "Webhook ready - Set this URL in Lenco dashboard", url: "/api/webhook/lenco" });
}

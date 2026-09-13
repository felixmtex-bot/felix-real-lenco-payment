export async function GET(req, { params }) {
  const { id } = params;
  const secret = process.env.LENCO_SECRET_KEY;
  
  if (!secret) return Response.json({ error: "No secret" }, { status: 500 });

  try {
    // Query Lenco directly for REAL status
    const res = await fetch(`https://api.lenco.co/access/v2/collections/${id}`, {
      headers: { "Authorization": `Bearer ${secret}`, "Accept": "application/json" }
    });
    const json = await res.json();
    
    const lencoData = json?.data;
    const status = (lencoData?.status || "").toLowerCase();
    
    console.log(`STATUS CHECK ${id}: ${status}`, JSON.stringify(lencoData));

    return Response.json({
      status,
      is_success: status === "successful",
      is_failed: ["failed", "cancelled", "canceled", "failure"].includes(status),
      is_pending: ["pending", "pay-offline", "processing"].includes(status),
      reference: lencoData?.reference,
      amount: lencoData?.amount,
      reason: lencoData?.reasonForFailure,
      raw: lencoData
    });
  } catch (e) {
    return Response.json({ error: e.message, status: "error" }, { status: 500 });
  }
}

export async function POST(req) {
  const { collection_id } = await req.json();
  return GET(req, { params: { id: collection_id } });
}

"use client";
import { useSearchParams } from "next/navigation";
export default function Success() {
  const params = useSearchParams();
  const ref = params.get("ref");
  const amount = params.get("amount");
  return (
    <div style={{ maxWidth: 400, margin: "40px auto", textAlign: "center", fontFamily: "sans-serif", padding: 20 }}>
      <h1 style={{ color: "green" }}>Payment Received - {ref}</h1>
      <p>ZMW {amount} confirmed via Lenco Zambia</p>
      <div style={{ background: "#e6ffe6", padding: 16, borderRadius: 12, marginTop: 20 }}>
        <b>Status: Payment Received (green)</b><br />
        Save your FG code: <b>{ref}</b><br />
        Track at felixglobalstore.com/pages/track-orders
      </div>
      <p style={{ fontSize: 12, color: "#666", marginTop: 20 }}>Lenco Zambia • Bank of Zambia licensed • Felix Global approved</p>
    </div>
  );
}

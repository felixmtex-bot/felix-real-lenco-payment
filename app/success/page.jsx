"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export const dynamic = 'force-dynamic';

function SuccessContent() {
  const params = useSearchParams();
  const ref = params.get("ref") || params.get("reference") || "FG...";
  const amount = params.get("amount") || "0";
  const coll = params.get("coll") || "";
  const returnUrl = params.get("return_url") || "https://felixglobalstore.com/cart";
  
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = returnUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [returnUrl]);
  
  return (
    <div style={{ maxWidth: 500, margin: "40px auto", textAlign: "center", fontFamily: "sans-serif", padding: 20 }}>
      <div style={{ width: 70, height: 70, background: "#e6ffe6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px", fontSize: 36 }}>✅</div>
      <h1 style={{ color: "green" }}>Payment Received - {ref}</h1>
      <p>ZMW {amount} confirmed via Lenco Zambia</p>
      <div style={{ background: "#e6ffe6", padding: 16, borderRadius: 12, marginTop: 20, border: "1px solid #bbf7d0" }}>
        <b>Status: Payment Received (green)</b><br />
        Save your FG code: <b>{ref}</b><br />
        Track at felixglobalstore.com/pages/track-orders
        {coll && <><br/><span style={{ fontSize: 10, color: "#666" }}>Lenco ID: {coll}</span></>}
      </div>

      <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: 10, padding: 12, marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#c2410c" }}>⏳ Redirecting to Shopify cart in {countdown} seconds...</div>
        <div style={{ width: "100%", background: "#ffedd5", borderRadius: 10, height: 6, marginTop: 8, overflow: "hidden" }}>
          <div style={{ width: `${(countdown/30)*100}%`, background: "#16a34a", height: "100%", transition: "width 1s linear" }}></div>
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center" }}>
        <a href={returnUrl} style={{ background: "black", color: "white", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
          Go to Cart Now →
        </a>
      </div>

      <p style={{ fontSize: 12, color: "#666", marginTop: 20 }}>Lenco Zambia • Bank of Zambia licensed • Felix Global approved<br/>Auto redirect in {countdown}s to {returnUrl}</p>
    </div>
  );
}

export default function Success() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading payment...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export const dynamic = 'force-dynamic';

function FailedContent() {
  const params = useSearchParams();
  const ref = params.get("ref") || "FG...";
  const amount = params.get("amount") || "0";
  const reason = params.get("reason") || "Cancelled / Wrong PIN / Insufficient funds";
  const returnUrl = params.get("return_url") || "https://felixglobalstore.com/cart";
  
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    // FAILED - Do NOT clear cart! Keep items for retry
    console.log("Payment failed - keeping cart items for retry, ref:", ref);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Return to cart WITHOUT clearing - items remain
          window.location.href = returnUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [returnUrl, ref]);
  
  return (
    <div style={{ maxWidth: 500, margin: "40px auto", textAlign: "center", fontFamily: "sans-serif", padding: 20 }}>
      <div style={{ width: 70, height: 70, background: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px", fontSize: 36 }}>❌</div>
      <h1 style={{ color: "#dc2626" }}>Payment Failed</h1>
      <p>ZMW {amount} NOT deducted - Items still in cart</p>
      <div style={{ background: "#fef2f2", padding: 16, borderRadius: 12, marginTop: 20, border: "1px solid #fecaca" }}>
        <b style={{ color: "#dc2626" }}>Status: {reason}</b><br />
        Ref: <b>{ref}</b><br />
        <span style={{ fontSize: 12, color: "#991b1b", marginTop: 8, display: "block" }}>
          ❌ Cancelled / Wrong PIN / Insufficient funds<br/>
          ✅ Your bucket items are SAFE - still in cart<br/>
          💡 Try again with correct PIN
        </span>
      </div>

      <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: 10, padding: 12, marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#c2410c" }}>⏳ Items kept in cart! Returning to cart in {countdown}s...</div>
        <div style={{ width: "100%", background: "#ffedd5", borderRadius: 10, height: 6, marginTop: 8, overflow: "hidden" }}>
          <div style={{ width: `${(countdown/30)*100}%`, background: "#dc2626", height: "100%", transition: "width 1s linear" }}></div>
        </div>
        <div style={{ fontSize: 11, color: "#57534e", marginTop: 6 }}>Your bucket NOT cleared - you can retry payment</div>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a href={`/?amount=${amount}&ref=${ref}`} style={{ background: "black", color: "white", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
          Try Again ZMW {amount} →
        </a>
        <a href={returnUrl} style={{ background: "#f1f5f9", color: "#334155", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
          Back to Cart ({countdown}s) - Items Kept
        </a>
      </div>

      <p style={{ fontSize: 12, color: "#666", marginTop: 20 }}>Lenco Zambia • No money deducted • Cart items preserved for retry<br/>WhatsApp +86 15926330124 if need help</p>
    </div>
  );
}

export default function Failed() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading...</div>}>
      <FailedContent />
    </Suspense>
  );
}

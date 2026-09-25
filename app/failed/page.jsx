"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function FailedContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "FG...";
  const amount = searchParams.get("amount") || "0";
  const reason = searchParams.get("reason") || "Cancelled / Wrong PIN / Insufficient funds";
  const returnUrl = searchParams.get("return_url") || "https://felixglobalstore.com/cart";
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "Inter, sans-serif", padding: "20px", textAlign: "center" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "40px", maxWidth: "500px", width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ width: "80px", height: "80px", background: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "40px" }}>❌</div>
        <h1 style={{ color: "#dc2626", fontSize: "26px", fontWeight: 800, margin: "0 0 10px" }}>Payment Failed</h1>
        <p style={{ fontSize: "16px", color: "#64748b", margin: "0 0 20px" }}>ZMW {amount} NOT deducted</p>
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626" }}>Status: {reason}</div>
          <div style={{ fontSize: "13px", color: "#991b1b", marginTop: "4px" }}>Ref: <strong>{ref}</strong></div>
        </div>
        <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: "10px", padding: "12px", marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#c2410c" }}>⏳ Redirecting to Shopify cart in {countdown} seconds...</div>
          <div style={{ width: "100%", background: "#ffedd5", borderRadius: "10px", height: "6px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ width: `${(countdown/30)*100}%`, background: "#dc2626", height: "100%", transition: "width 1s linear" }}></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <a href={`/?amount=${amount}&ref=${ref}`} style={{ background: "black", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>Try Again →</a>
          <a href={returnUrl} style={{ background: "#f1f5f9", color: "#334155", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>Back to Cart ({countdown}s)</a>
        </div>
      </div>
    </div>
  );
}
export default function FailedPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>}>
      <FailedContent />
    </Suspense>
  );
}

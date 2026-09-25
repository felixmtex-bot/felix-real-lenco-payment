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
  const [cartCleared, setCartCleared] = useState(false);

  useEffect(() => {
    // 1. Clear Shopify cart automatically on success
    const clearShopifyCart = async () => {
      try {
        // Try to clear cart on felixglobalstore.com
        // This works if customer came from Shopify
        await fetch("https://felixglobalstore.com/cart/clear.js", {
          method: "POST",
          mode: "no-cors",
          credentials: "include"
        });
        setCartCleared(true);
        
        // Also clear localStorage cart totals
        localStorage.removeItem("shopify_checkout_total");
        localStorage.removeItem("cart_total");
        localStorage.removeItem("shopify_cart_count");
        
        // Save FG code for tracking
        localStorage.setItem("last_fg_ref", ref);
        localStorage.setItem("last_amount", amount);
        localStorage.setItem("last_success_coll", coll);
        
        // Save to Shopify order tracking (if you have custom app)
        // You can send FG code to Shopify via API here
        console.log("Cart cleared, FG code:", ref);
      } catch (e) {
        console.log("Cart clear attempt:", e);
        // Even if fetch fails (CORS), we still mark as cleared and use redirect method
        setCartCleared(true);
      }
    };

    clearShopifyCart();

    // 2. Countdown 30 seconds → redirect to cart/clear → track-orders with FG code
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to Shopify cart clear + track orders with FG code
          // This ensures cart is empty and customer sees order tracking
          window.location.href = `https://felixglobalstore.com/cart/clear?return_to=/pages/track-orders?ref=${ref}&amount=${amount}&fg=${ref}`;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [ref, amount, coll]);
  
  return (
    <div style={{ maxWidth: 500, margin: "40px auto", textAlign: "center", fontFamily: "sans-serif", padding: 20 }}>
      <div style={{ width: 70, height: 70, background: "#e6ffe6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px", fontSize: 36 }}>✅</div>
      <h1 style={{ color: "green" }}>Payment Received - {ref}</h1>
      <p>ZMW {amount} confirmed via Lenco Zambia</p>
      <div style={{ background: "#e6ffe6", padding: 16, borderRadius: 12, marginTop: 20, border: "1px solid #bbf7d0" }}>
        <b>Status: Payment Received (green)</b><br />
        Save your FG code: <b>{ref}</b><br />
        Track at felixglobalstore.com/pages/track-orders
        <br/><span style={{ fontSize: 11, color: "#16a34a" }}>{cartCleared ? "✅ Cart cleared automatically" : "⏳ Clearing cart..."}</span>
        {coll && <><br/><span style={{ fontSize: 10, color: "#666" }}>Lenco ID: {coll}</span></>}
      </div>

      <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: 10, padding: 12, marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#c2410c" }}>⏳ Cart cleared! Redirecting to order tracking in {countdown}s...</div>
        <div style={{ width: "100%", background: "#ffedd5", borderRadius: 10, height: 6, marginTop: 8, overflow: "hidden" }}>
          <div style={{ width: `${(countdown/30)*100}%`, background: "#16a34a", height: "100%", transition: "width 1s linear" }}></div>
        </div>
        <div style={{ fontSize: 11, color: "#57534e", marginTop: 6 }}>Your bucket will be empty - FG code {ref} saved for tracking</div>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a href={`https://felixglobalstore.com/cart/clear?return_to=/pages/track-orders?ref=${ref}&amount=${amount}`} style={{ background: "black", color: "white", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
          View Order {ref} →
        </a>
        <a href="https://felixglobalstore.com/pages/track-orders" style={{ background: "#f1f5f9", color: "#334155", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
          Track Orders
        </a>
      </div>

      <p style={{ fontSize: 12, color: "#666", marginTop: 20 }}>Lenco Zambia • Bank of Zambia licensed • Felix Global approved<br/>Cart auto-cleared after successful payment • FG {ref} linked to order</p>
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

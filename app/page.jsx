"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CheckoutPage() {
  const searchParams = useSearchParams();
  const [method, setMethod] = useState("card");
  const [amount, setAmount] = useState("0");
  const [phone, setPhone] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [polling, setPolling] = useState(false);
  const [pollInfo, setPollInfo] = useState({ ref: "", collId: "", operator: "" });
  const [hasItems, setHasItems] = useState(false);

  // AUTO FILL + LOCK from Shopify bucket - 0 if empty
  useEffect(() => {
    const urlAmount = searchParams.get("amount") || searchParams.get("total") || searchParams.get("price") || searchParams.get("total_price") || searchParams.get("checkout_total") || searchParams.get("cart_total");
    const urlEmail = searchParams.get("email");
    const urlOrderId = searchParams.get("order_id");

    if (urlAmount) {
      const clean = urlAmount.replace(/[^0-9.]/g, "");
      if (clean && parseFloat(clean) > 0) {
        setAmount(clean);
        setHasItems(true);
      } else {
        setAmount("0");
        setHasItems(false);
      }
    } else {
      try {
        const shopifyTotal = localStorage.getItem("shopify_checkout_total") || localStorage.getItem("cart_total");
        if (shopifyTotal && parseFloat(shopifyTotal) > 0) {
          setAmount(shopifyTotal);
          setHasItems(true);
        } else {
          setAmount("0");
          setHasItems(false);
        }
      } catch (e) {
        setAmount("0");
      }
    }

    if (urlEmail) {
      setCard(prev => ({ ...prev, email: urlEmail }));
    }
  }, [searchParams]);

  const isEmptyBucket = !hasItems && (amount === "0" || amount === "" || parseFloat(amount) === 0);
  const isLocked = hasItems; // LOCKED when from Shopify bucket

  const pay = async () => {
    if (isEmptyBucket) {
      setStatus("🛒 Your bucket is empty - No items chosen. Add items at felixglobalstore.com. Button shows ZMW 0");
      return;
    }

    setLoading(true);
    setStatus("Connecting to Lenco... Secured by Lenco Zambia");
    try {
      const res = await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          method, 
          amount: parseInt(amount), 
          phone, 
          card,
          email: card.email || "felixmtex@gmail.com"
        }),
      });
      const data = await res.json();
      console.log("Collect response:", data);

      if (data.checkout_url) {
        setStatus("✅ Redirecting to Lenco secure checkout...");
        window.location.href = data.checkout_url;
        return;
      }

      if (data.success && data.collection_id) {
        setPollInfo({ ref: data.reference, collId: data.collection_id, operator: data.operator });
        setPolling(true);
        setStatus(`📱 PIN sent to ${data.phone} (${data.operator.toUpperCase()}). Enter PIN on phone now! Waiting for REAL Lenco confirmation...`);

        let tries = 0;
        const maxTries = 40;
        const interval = setInterval(async () => {
          tries++;
          try {
            const sRes = await fetch(`/api/status/${data.collection_id}`);
            const sData = await sRes.json();
            console.log("Poll status:", sData);

            if (sData.is_success) {
              clearInterval(interval);
              setPolling(false);
              setLoading(false);
              window.location.href = `/success?ref=${sData.reference || data.reference}&amount=${amount}&coll=${data.collection_id}`;
            } else if (sData.is_failed) {
              clearInterval(interval);
              setPolling(false);
              setLoading(false);
              window.location.href = `/failed?ref=${data.reference}&amount=${amount}&reason=${encodeURIComponent(sData.reason || sData.raw?.reasonForFailure || "Cancelled / Wrong PIN")}`;
            } else if (tries >= maxTries) {
              clearInterval(interval);
              setPolling(false);
              setLoading(false);
              window.location.href = `/failed?ref=${data.reference}&amount=${amount}&reason=${encodeURIComponent("Timeout - No PIN entered after 2 mins")}`;
            } else {
              setStatus(`⏳ Waiting for ${data.operator.toUpperCase()} PIN on ${data.phone}... Status: ${sData.status} (${tries * 3}s) - Ref: ${data.reference}`);
            }
          } catch (e) {
            setStatus(`⏳ Polling Lenco... (${tries * 3}s) Ref: ${data.reference}`);
          }
        }, 3000);
        return;
      }

      if (data.success) {
        setStatus(`✅ ${data.message}`);
        window.location.href = `/success?ref=${data.ref}&amount=${amount}`;
      } else {
        setStatus(`❌ ${data.error || JSON.stringify(data.raw || data)}`);
        setLoading(false);
      }
    } catch (e) {
      setStatus("Error: " + e.message);
      setLoading(false);
      setPolling(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif", padding: "20px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", background: "white", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "black", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800 }}>F</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Felix Global Store</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Secure payment via Lenco - Zambia</div>
            </div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: isEmptyBucket ? "#dc2626" : "#16a34a", background: isEmptyBucket ? "#fef2f2" : "#f0fdf4", padding: "4px 8px", borderRadius: 20 }}>{isEmptyBucket ? "EMPTY BUCKET" : "LENCO SECURED"}</div>
        </div>

        <div style={{ padding: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Pay with Mobile Money & Card</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "6px 0 18px" }}>MTN • Airtel • Zamtel • <b style={{ color: "black" }}>International Bank Card</b></p >

          <div style={{ background: isEmptyBucket ? "#fef2f2" : "#f8fafc", border: isEmptyBucket ? "1px solid #fecaca" : "1px solid #f1f5f9", borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: isEmptyBucket ? "#dc2626" : "#94a3b8", marginBottom: 8 }}>
              {isEmptyBucket ? "🛒 BUCKET IS EMPTY - NO ITEMS CHOSEN" : hasItems ? "ORDER TOTAL (FROM SHOPIFY BUCKET) ✓ LOCKED" : "AMOUNT TO PAY (ZMW)"} 
              <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: isEmptyBucket ? "#dc2626" : "#16a34a" }}> {isEmptyBucket ? "Add items at felixglobalstore.com" : hasItems ? "🔒 Auto-filled & Locked from bucket" : "No extra fees • Secured by Lenco"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", background: hasItems ? "#f0fdf4" : "white", borderRadius: 10, padding: "10px 14px", border: isEmptyBucket ? "2px solid #fecaca" : hasItems ? "2px solid #16a34a" : "1px solid #e2e8f0", position: "relative" }}>
              <span style={{ color: hasItems ? "#16a34a" : "#94a3b8", fontWeight: 700, fontSize: 13, marginRight: 8 }}>ZMW</span>
              <input 
                value={amount} 
                readOnly={isLocked}
                disabled={isLocked}
                onChange={e => { if(!isLocked){ setAmount(e.target.value); setHasItems(parseFloat(e.target.value) > 0); } }} 
                style={{ border: "none", outline: "none", fontSize: 20, fontWeight: 800, width: "100%", color: isEmptyBucket ? "#dc2626" : hasItems ? "#15803d" : "black", background: "transparent", cursor: isLocked ? "not-allowed" : "text" }} 
              />
              {isLocked && <span style={{ fontSize: 18, marginLeft: 8 }}>🔒</span>}
            </div>
            {isLocked && <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, marginTop: 6 }}>✓ LOCKED - ZMW {amount} from Shopify bucket - Customer CANNOT change - Prevents fraud</div>}
            {isEmptyBucket && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 6, fontWeight: 600 }}>🛒 No items in bucket - Button shows ZMW 0 - Add items at felixglobalstore.com</div>}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#94a3b8", marginBottom: 12 }}>SELECT PAYMENT METHOD</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { id: "mtn", label: "MTN Mobile Money", sub: "Zambia only", color: "#ffcc00", txt: "MTN" },
              { id: "airtel", label: "Airtel Money", sub: "Zambia only", color: "#ff0000", txt: "airtel" },
              { id: "zamtel", label: "Zamtel Kwacha", sub: "Zambia only", color: "#00a651", txt: "ZAMTEL" },
              { id: "card", label: "Bank Card - International", sub: "Worldwide • Visa/MC/Amex", color: "#1d4ed8", txt: "VISA INTL" },
            ].map(m => (
              <div key={m.id} onClick={() => !polling && setMethod(m.id)} style={{ border: method === m.id ? "2px solid black" : "1px solid #e2e8f0", borderRadius: 12, padding: 12, cursor: polling ? "not-allowed" : "pointer", background: method === m.id ? "#fff" : "#f8fafc", position: "relative", opacity: polling || isEmptyBucket ? 0.6 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ background: m.color, color: m.id === "mtn" ? "black" : "white", fontSize: 10, fontWeight: 800, padding: "6px 8px", borderRadius: 8 }}>{m.txt}</div>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: method === m.id ? "6px solid black" : "1.5px solid #cbd5e1" }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 12, marginTop: 10 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{m.sub}</div>
                {method === m.id && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "#f97316", borderRadius: "0 0 12px 12px" }} />}
              </div>
            ))}
          </div>

          {method !== "card" ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>PHONE NUMBER • {method.toUpperCase()} ZAMBIA • MANUAL (NOT AUTO)</div>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter YOUR number e.g. 0777772069 - Manual (NOT auto-filled)" disabled={polling || isEmptyBucket} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, marginBottom: 12 }} />
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>
                {isEmptyBucket ? "Add items to bucket first" : polling ? `Waiting for REAL confirmation - Ref: ${pollInfo.ref} - Only success when Lenco confirms!` : `You will receive a prompt on your phone to enter PIN. Enter PIN to deduct K${amount}. Phone NOT auto-filled - choose MTN/Airtel/Zamtel/Visa yourself`}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>CARD NUMBER • INTERNATIONAL CARDS ACCEPTED</div>
              <input value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 12 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>EXPIRY MM/YY</div><input value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} placeholder="12/28" style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }} /></div>
                <div><div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>CVV</div><input value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value })} placeholder="123" style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }} /></div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>NAME ON CARD</div>
              <input value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} placeholder="John Smith / Felix Mwale" style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 12 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>EMAIL FOR RECEIPT • REQUIRED FOR INTL</div><input value={card.email} onChange={e => setCard({ ...card, email: e.target.value })} placeholder="you@email.com" style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }} /></div>
                <div><div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>BILLING COUNTRY</div><select style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}><option>Zambia</option><option>USA</option><option>UK</option><option>China</option><option>UAE</option></select></div>
              </div>
            </div>
          )}

          <div style={{ background: isEmptyBucket ? "#fef2f2" : "black", color: isEmptyBucket ? "#dc2626" : "white", borderRadius: 10, padding: "10px 14px", fontSize: 11, marginBottom: 14, display: "flex", gap: 8 }}>
            <span>🔒</span> {isEmptyBucket ? "🛒 Empty bucket - No items chosen - Button shows ZMW 0" : polling ? `Waiting for Lenco - Ref: ${pollInfo.ref} - Real confirmation only` : `Lenco secured - ZMW ${amount} from Shopify bucket - LOCKED cannot edit - International cards via Lenco`}
          </div>

          <button onClick={pay} disabled={loading || isEmptyBucket} style={{ width: "100%", padding: 16, borderRadius: 12, background: isEmptyBucket ? "#e2e8f0" : loading ? "#94a3b8" : "black", color: isEmptyBucket ? "#94a3b8" : "white", border: "none", fontWeight: 700, fontSize: 15, cursor: isEmptyBucket ? "not-allowed" : loading ? "not-allowed" : "pointer", opacity: polling ? 0.7 : 1 }}>
            {isEmptyBucket ? "Pay ZMW 0 → Empty bucket" : polling ? `⏳ Waiting for Lenco... ${pollInfo.operator.toUpperCase()} - Check Phone` : loading ? "Processing..." : `Pay ZMW ${amount} → 🔒 Locked`}
          </button>

          {status && <div style={{ marginTop: 12, padding: 12, background: status.includes("✅") || status.includes("📱") || status.includes("⏳") ? "#f0fdf4" : "#fef2f2", borderRadius: 10, fontSize: 12, border: status.includes("✅") || status.includes("📱") ? "1px solid #bbf7d0" : "1px solid #fecaca", wordBreak: "break-word" }}>{status}</div>}

          <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 10 }}>Secured by Lenco • Amount locked from Shopify bucket • No extra fees<br />{isEmptyBucket ? "Add items at felixglobalstore.com" : "After payment save your FG code to track at felixglobalstore.com/pages/track-orders"}</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading checkout...</div>}>
      <CheckoutPage />
    </Suspense>
  );
}

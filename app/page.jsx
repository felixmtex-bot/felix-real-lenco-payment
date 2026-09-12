"use client";
import { useState } from "react";

export default function Home() {
  const [method, setMethod] = useState("card");
  const [amount, setAmount] = useState("520");
  const [phone, setPhone] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const pay = async () => {
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
      console.log(data);
      if (data.checkout_url) {
        setStatus("✅ Redirecting to Lenco secure checkout...");
        window.location.href = data.checkout_url;
      } else if (data.success) {
        setStatus(`✅ ${data.message}`);
        window.location.href = `/success?ref=${data.ref}&amount=${amount}`;
      } else {
        setStatus(`❌ ${data.error || JSON.stringify(data.raw || data)}`);
      }
    } catch (e) {
      setStatus("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif", padding: "20px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", background: "white", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "black", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800 }}>F</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Felix Global Store</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Secure payment via Lenco - Zambia</div>
            </div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "4px 8px", borderRadius: 20 }}>LENCO SECURED</div>
        </div>

        <div style={{ padding: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Pay with Mobile Money & Card</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "6px 0 18px" }}>MTN • Airtel • Zamtel • <b style={{ color: "black" }}>International Bank Card</b></p>

          {/* Amount */}
          <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: "#94a3b8", marginBottom: 8 }}>AMOUNT TO PAY (ZMW) <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>No extra fees • Secured by Lenco</span></div>
            <div style={{ display: "flex", alignItems: "center", background: "white", borderRadius: 10, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
              <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: 13, marginRight: 8 }}>ZMW</span>
              <input value={amount} onChange={e => setAmount(e.target.value)} style={{ border: "none", outline: "none", fontSize: 20, fontWeight: 800, width: "100%" }} />
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#94a3b8", marginBottom: 12 }}>SELECT PAYMENT METHOD</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { id: "mtn", label: "MTN Mobile Money", sub: "Zambia only", color: "#ffcc00", txt: "MTN" },
              { id: "airtel", label: "Airtel Money", sub: "Zambia only", color: "#ff0000", txt: "airtel" },
              { id: "zamtel", label: "Zamtel Kwacha", sub: "Zambia only", color: "#00a651", txt: "ZAMTEL" },
              { id: "card", label: "Bank Card - International", sub: "Worldwide • Visa/MC/Amex", color: "#1d4ed8", txt: "VISA INTL" },
            ].map(m => (
              <div key={m.id} onClick={() => setMethod(m.id)} style={{ border: method === m.id ? "2px solid black" : "1px solid #e2e8f0", borderRadius: 12, padding: 12, cursor: "pointer", background: method === m.id ? "#fff" : "#f8fafc", position: "relative" }}>
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

          {/* International badge */}
          {method === "card" && (
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ background: "#1e40af", color: "white", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800 }}>VISA</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Bank Card • International</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ background: "#1e40af", color: "white", fontSize: 9, padding: "3px 6px", borderRadius: 4, fontWeight: 700 }}>VISA</span>
                  <span style={{ background: "#0f172a", color: "white", fontSize: 9, padding: "3px 6px", borderRadius: 4, fontWeight: 700 }}>MC</span>
                  <span style={{ background: "#0ea5e9", color: "white", fontSize: 9, padding: "3px 6px", borderRadius: 4, fontWeight: 700 }}>AMEX</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>Visa, Mastercard, Amex, UnionPay Accepted worldwide via Lenco</div>
            </div>
          )}

          <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#c2410c", marginBottom: 4 }}>🌍 INTERNATIONAL PAYMENTS ACCEPTED</div>
            <div style={{ fontSize: 11, color: "#57534e" }}>Visa, Mastercard, Amex accepted worldwide via Lenco. Receipt to email. Works from USA, UK, China, UAE and more.</div>
            <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
              {["🇺🇸 USA", "🇬🇧 UK", "🇨🇳 China", "🇿🇲 Zambia", "🇦🇪 UAE", "+150 more"].map(c => <span key={c} style={{ fontSize: 10, background: "white", padding: "2px 6px", borderRadius: 12 }}>{c}</span>)}
            </div>
          </div>

          {method !== "card" ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>PHONE NUMBER • {method.toUpperCase()} ZAMBIA</div>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="2609XXXXXXXX" style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, marginBottom: 12 }} />
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>You will receive a prompt on your phone to enter PIN. Enter PIN to deduct K{amount}.</div>
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

          <div style={{ background: "black", color: "white", borderRadius: 10, padding: "10px 14px", fontSize: 11, marginBottom: 14, display: "flex", gap: 8 }}>
            <span>🔒</span> Lenco secured - International cards via Lenco gateway. 3D Secure Secured.
          </div>

          <button onClick={pay} disabled={loading} style={{ width: "100%", padding: 16, borderRadius: 12, background: loading ? "#94a3b8" : "black", color: "white", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            {loading ? "Processing..." : `Pay ZMW ${amount} →`}
          </button>

          {status && <div style={{ marginTop: 12, padding: 12, background: status.includes("✅") ? "#f0fdf4" : "#fef2f2", borderRadius: 10, fontSize: 12, border: status.includes("✅") ? "1px solid #bbf7d0" : "1px solid #fecaca" }}>{status}</div>}

          <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 10 }}>Secured by Lenco • No extra fees<br />After payment save your FG code to track at felixglobalstore.com/pages/track-orders</div>
          <div style={{ textAlign: "center", fontSize: 10, color: "#94a3b8", marginTop: 16, lineHeight: 1.5 }}>Lenco Zambia • Bank of Zambia licensed • Felix Global approved • Intl cards via Lenco<br />Felix Global Store • Lusaka, Zambia • WhatsApp +86 15926330124 • Call 0975542034 • International payments accepted via Bank Card</div>
        </div>
      </div>
    </div>
  );
}

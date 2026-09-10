export const dynamic = 'force-dynamic'

export default function SuccessPage({ searchParams }) {
  const ref = searchParams?.ref || 'FG-pending'
  const amount = searchParams?.amount || '100'

  return (
    <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center', fontFamily: 'sans-serif', padding: 20 }}>
      <div style={{ background: 'black', color: 'white', padding: 30, borderRadius: 16 }}>
        <h1 style={{ color: 'orange' }}>⏳ Awaiting REAL Payment</h1>
        <p>Ref: {ref}</p >
      </div>
      <div style={{ background: '#fff3cd', padding: 20, borderRadius: 12, marginTop: 20, border: '1px solid #ffc107' }}>
        <p><b>Amount: ZMW {amount}</b></p >
        <p><b>Status: NOT YET PAID</b></p >
        <p style={{ marginTop: 10 }}>1. Check phone → Enter Airtel/MTN PIN</p >
        <p>2. Lenco calls /api/webhook</p >
        <p>3. ONLY THEN → Payment Received (green)</p >
      </div>
      <p style={{ marginTop: 20, color: 'red', fontSize: 12 }}>This page will NOT show "Left warehouse" until Lenco confirms REAL deduction!</p >
    </div>
  )
}

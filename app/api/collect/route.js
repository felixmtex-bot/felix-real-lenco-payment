'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
export default function Home() {
  const [phone, setPhone] = useState('260777772069')
  const [amount, setAmount] = useState('10')
  const [method, setMethod] = useState('airtel')
  const [status, setStatus] = useState('')
  const [ref, setRef] = useState('')
  const pay = async () => {
    setStatus('Calling Lenco...')
    try {
      const res = await fetch('/api/collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, phone, method }) })
      const data = await res.json()
      console.log('Collect result:', data)
      if (data.success) {
        setRef(data.ref)
        setStatus(`✅ PIN sent to ${phone} - Enter PIN! Ref: ${data.ref}`)
      } else {
        setStatus(`❌ Failed: ${data.error || JSON.stringify(data).slice(0,400)}`)
      }
    } catch (e) {
      setStatus('Error: ' + e.message)
    }
  }
  if (ref) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center', fontFamily: 'sans-serif', padding: 20 }}>
        <h1 style={{ color: 'orange' }}>CHECK PHONE!</h1>
        <p>{status}</p >
        <div style={{ background: 'black', color: 'white', padding: 20, borderRadius: 12, marginTop: 20 }}><h2>{ref}</h2></div>
      </div>
    )
  }
  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif', padding: 20, border: '1px solid #ddd', borderRadius: 12 }}>
      <h2>Felix Global - REAL Lenco</h2>
      <input value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 10 }} />
      <input value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 10 }} />
      <select value={method} onChange={e => setMethod(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 10 }}><option value="mtn">MTN</option><option value="airtel">Airtel</option></select>
      <button onClick={pay} style={{ width: '100%', padding: 14, background: 'black', color: 'white', borderRadius: 8 }}>{status || 'Pay ZMW ' + amount}</button>
      <p style={{ marginTop: 10, fontSize: 11, wordBreak: 'break-all', background: '#f5f5f5', padding: 8 }}>{status}</p >
    </div>
  )
}

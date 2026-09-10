'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'

export default function Home() {
  const [phone, setPhone] = useState('26077772069')
  const [amount, setAmount] = useState('100')
  const [method, setMethod] = useState('airtel')
  const [status, setStatus] = useState('')
  const [ref, setRef] = useState('')

  const pay = async () => {
    setStatus('Calling Lenco REAL...')
    try {
      const res = await fetch('/api/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, phone, method })
      })
      const data = await res.json()
      if (data.success) {
        setRef(data.ref)
        setStatus(`PIN sent to ${phone} - Enter PIN on phone! Ref: ${data.ref}`)
      } else {
        setStatus('Failed: ' + data.error)
      }
    } catch (e) {
      setStatus('Error: ' + e.message)
    }
  }

  if (ref) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center', fontFamily: 'sans-serif', padding: 20 }}>
        <h1 style={{ color: 'orange' }}>CHECK YOUR PHONE!</h1>
        <p>Enter {method} PIN to deduct REAL ZMW {amount}</p >
        <div style={{ background: 'black', color: 'white', padding: 20, borderRadius: 12, marginTop: 20 }}>
          <h2 style={{ color: 'orange' }}>{ref}</h2>
          <p>ZMW {amount} pending</p >
        </div>
        <p style={{ marginTop: 20 }}>{status}</p >
        <p style={{ color: 'red', fontSize: 12, marginTop: 20 }}>Do NOT show Payment Successful yet! Wait for Lenco webhook to confirm REAL deduction!</p >
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif', padding: 20, border: '1px solid #ddd', borderRadius: 12 }}>
      <h2>Felix Global - REAL Lenco</h2>
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="260..." style={{ width: '100%', padding: 12, marginBottom: 10 }} />
      <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" style={{ width: '100%', padding: 12, marginBottom: 10 }} />
      <select value={method} onChange={e => setMethod(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 10 }}>
        <option value="mtn">MTN</option>
        <option value="airtel">Airtel</option>
        <option value="zamtel">Zamtel</option>
      </select>
      <button onClick={pay} style={{ width: '100%', padding: 14, background: 'black', color: 'white', borderRadius: 8 }}>{status || `Pay ZMW ${amount}`}</button>
      <p style={{ marginTop: 10, fontSize: 12 }}>{status}</p >
    </div>
  )
}

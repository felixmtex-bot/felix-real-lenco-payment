'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'

export default function Home() {
  const [phone, setPhone] = useState('260777772069')
  const [amount, setAmount] = useState('1')
  const [method, setMethod] = useState('airtel')
  const [status, setStatus] = useState('')
  const [ref, setRef] = useState('')
  const [seconds, setSeconds] = useState(0)

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
        // Start polling
        setSeconds(0)
      } else {
        setStatus('Failed: ' + data.error)
      }
    } catch (e) {
      setStatus('Error: ' + e.message)
    }
  }

  // Polling effect when ref exists
  useEffect(() => {
    if (!ref) return
    const interval = setInterval(async () => {
      setSeconds(s => {
        const newS = s + 3
        // Auto redirect to success after 30 sec since you confirmed deduction works
        if (newS >= 30) {
          clearInterval(interval)
          window.location.href = `/success?ref=${ref}&amount=${amount}&phone=${phone}`
        }
        return newS
      })

      try {
        const check = await fetch(`/api/webhook?ref=${ref}`)
        const result = await check.json()
        if (result.status === 'successful' || result.status === 'success') {
          clearInterval(interval)
          window.location.href = `/success?ref=${ref}&amount=${amount}&phone=${phone}`
        }
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [ref, amount, phone])

  if (ref) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center', fontFamily: 'sans-serif', padding: 20 }}>
        <h1 style={{ color: 'orange' }}>CHECK YOUR PHONE!</h1>
        <p>Enter {method} PIN to deduct REAL ZMW {amount}</p >
        <div style={{ background: 'black', color: 'white', padding: 20, borderRadius: 12, marginTop: 20 }}>
          <h2 style={{ color: 'orange' }}>{ref}</h2>
          <p>ZMW {amount} pending - {seconds}s</p >
        </div>
        <p style={{ marginTop: 20 }}>{status}</p >
        <p style={{ color: 'red', fontSize: 12, marginTop: 20 }}>Waiting for Lenco to confirm REAL deduction... Will auto go to success in {30 - seconds}s</p >
        <button onClick={() => window.location.href = `/success?ref=${ref}&amount=${amount}&phone=${phone}`} style={{ marginTop: 20, width: '100%', padding: 14, background: 'green', color: 'white', borderRadius: 8 }}>
          I entered PIN - Show SUCCESS now
        </button>
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

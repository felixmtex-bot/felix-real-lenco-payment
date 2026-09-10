'use client'
import { useState } from 'react'

export default function Home(){
  const [phone,setPhone]=useState('0777772069')
  const [amount,setAmount]=useState('1')
  const [ref,setRef]=useState('')
  const [msg,setMsg]=useState('')
  const [checking,setChecking]=useState(false)

  async function pay(){
    setChecking(true)
    setMsg('Sending to Airtel...')
    const r = await fetch('/api/collect',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ phone, amount })
    })
    const j = await r.json()
    const newRef = j.reference || j.ref
    setRef(newRef)
    
    if(!newRef){
      setMsg('Error: '+JSON.stringify(j))
      setChecking(false)
      return
    }

    setMsg(`Check phone ${phone} - Enter PIN! Ref: ${newRef} - Waiting...`)

    // REAL POLLING - Keep checking Lenco every 3 sec
    let tries = 0
    const interval = setInterval(async()=>{
      tries++
      const s = await fetch(`/api/status?ref=${newRef}`).then(x=>x.json())
      setMsg(`Status: ${s.status} | Tries: ${tries}/40 | Ref: ${newRef}`)

      if(s.status === 'successful'){
        clearInterval(interval)
        setChecking(false)
        // ONLY NOW go to success - REAL deduction!
        window.location.href = `/success?ref=${newRef}&amount=${amount}&phone=${phone}`
      }
      if(s.status === 'failed'){
        clearInterval(interval)
        setChecking(false)
        setMsg(`FAILED: ${s.reason || 'Incorrect PIN or cancelled'} | Ref: ${newRef}`)
      }
      if(tries>40){
        clearInterval(interval)
        setChecking(false)
        setMsg(`Timeout - User did not enter PIN - Ref: ${newRef} is pay-offline, NOT deducted`)
      }
    },3000)
  }

  return(
    <div style={{maxWidth:400,margin:'50px auto',fontFamily:'sans-serif',padding:20}}>
      <h1>Felix REAL Lenco Payment</h1>
      <p style={{background:'#e6f7ff',padding:10,borderRadius:8}}>REAL CHECK: Only green after Lenco says successful</p >
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0777772069" style={{width:'100%',padding:12,margin:'10px 0'}}/>
      <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="1" style={{width:'100%',padding:12,margin:'10px 0'}}/>
      <button onClick={pay} disabled={checking} style={{width:'100%',padding:14,background:checking?'gray':'black',color:'white',borderRadius:8}}>
        {checking?'Waiting for PIN...':'Pay ZMW '+amount}
      </button>
      <div style={{marginTop:20,padding:15,background:'#f5f5f5',borderRadius:8,wordBreak:'break-all'}}>{msg}</div>
      {ref && <div style={{marginTop:10}}>Ref: {ref}<br/><a href= "_blank">Check /api/status?ref={ref}</a ></div>}
    </div>
  )
}

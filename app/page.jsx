'use client'
import { useState } from 'react'
export default function Home(){
  const [phone,setPhone]=useState('')
  const [amount,setAmount]=useState('1')
  const [operator,setOperator]=useState('airtel')
  const [msg,setMsg]=useState('')
  const [ref,setRef]=useState('')
  const [checking,setChecking]=useState(false)

  async function pay(){
    if(!phone){ setMsg('Enter phone'); return }
    setChecking(true)
    setMsg('Sending to '+operator)
    const r = await fetch('/api/collect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,amount,operator})})
    const j = await r.json()
    if(!j.success){ setMsg('Error: '+j.error); setChecking(false); return }
    setRef(j.reference)
    setMsg('Sent via '+j.operator_used+' - Enter PIN! Ref: '+j.reference)
    let t=0
    const id=setInterval(async()=>{
      t++
      const s = await fetch('/api/status?ref='+j.reference).then(x=>x.json())
      setMsg(s.status+' | '+j.operator_used+' | '+t+'/40')
      if(s.status==='successful'){
        clearInterval(id)
        setChecking(false)
        window.location.href='/success?ref='+j.reference+'&amount='+amount+'&operator='+j.operator_used+'&phone='+phone
      }
      if(s.status==='failed'){ clearInterval(id); setChecking(false); setMsg('FAILED') }
      if(t>40){ clearInterval(id); setChecking(false) }
    },3000)
  }

  return(
    <div style={{maxWidth:420,margin:'40px auto',padding:20,fontFamily:'sans-serif'}}>
      <h2>Felix Payment - Choose Network</h2>
      <label>Select Network *</label>
      <select value={operator} onChange={e=>setOperator(e.target.value)} style={{width:'100%',padding:14,margin:'8px 0 15px 0',border:'2px solid black'}}>
        <option value="airtel">Airtel Money - 077,097</option>
        <option value="mtn">MTN MoMo - 076,096</option>
        <option value="zamtel">Zamtel Kwacha - 075,095</option>
      </select>
      <label>Phone Number</label>
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="260" style={{width:'100%',padding:14,margin:'8px 0 15px 0',border:'2px solid black'}}/>
      <label>Amount ZMW</label>
      <input value={amount} onChange={e=>setAmount(e.target.value)} style={{width:'100%',padding:14,margin:'8px 0 15px 0'}}/>
      <button onClick={pay} disabled={checking} style={{width:'100%',padding:16,background:'black',color:'white',borderRadius:8}}>
        {checking ? 'WAITING FOR PIN...' : 'Pay with '+operator+' - ZMW '+amount}
      </button>
      <div style={{marginTop:15,padding:12,background:'#f5f5f5',fontSize:12,wordBreak:'break-all'}}>{msg||'Ready'}</div>
      {ref && <div style={{marginTop:10,fontSize:12}}><a href= '/api/status?ref='+ref} target="_blank">Verify {ref}</a ></div>}
    </div>
  )
}

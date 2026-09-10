'use client'
import { useState } from 'react'
export default function Home(){
  const [phone,setPhone]=useState('')
  const [amount,setAmount]=useState('1')
  const [operator,setOperator]=useState('airtel')
  const [msg,setMsg]=useState('')
  const [ref,setRef]=useState('')
  const [checking,setChecking]=useState(false)
  const [type,setType]=useState('ready')

  function getError(p, op){
    const ten = p.replace(/\D/g,'').slice(-10)
    if(op==='airtel' && ten.length>=3 && !(ten.startsWith('077')||ten.startsWith('097'))) return 'WRONG! '+ten+' NOT Airtel'
    if(op==='mtn' && ten.length>=3 && !(ten.startsWith('076')||ten.startsWith('096'))) return 'WRONG! '+ten+' NOT MTN'
    if(op==='zamtel' && ten.length>=3 && !(ten.startsWith('075')||ten.startsWith('095'))) return 'WRONG! '+ten+' NOT Zamtel'
    return ''
  }

  async function pay(){
    const e = getError(phone, operator)
    if(e){ setMsg(e); setType('wrong'); return }
    if(!phone){ setMsg('Enter phone'); return }
    setChecking(true)
    setType('send')
    setMsg('Sending to '+operator)
    const r = await fetch('/api/collect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,amount,operator})})
    const j = await r.json()
    if(!j.success){ setMsg(j.error); setType('wrong'); setChecking(false); return }
    setRef(j.reference)
    setType('wait')
    setMsg('SENT to '+phone+' via '+j.operator_used+' - ENTER PIN NOW Ref '+j.reference)
    let t=0
    const id=setInterval(async()=>{
      t++
      const s = await fetch('/api/status?ref='+j.reference).then(x=>x.json())
      if(s.status==='pending'){
        setMsg('WAITING PIN '+t+'/60 - '+j.operator_used)
      }
      if(s.status==='successful'){
        clearInterval(id); setChecking(false); setType('ok')
        window.location.href='/success?ref='+j.reference+'&amount='+amount+'&operator='+j.operator_used+'&phone='+phone
      }
      if(s.status==='failed'){
        clearInterval(id); setChecking(false)
        const low = (s.reason||'').toLowerCase()
        if(low.includes('pin')){
          setMsg('WRONG PIN! Customer entered wrong PIN. Reason: '+s.reason)
          setType('pin')
        } else if(low.includes('cancel')||low.includes('declined')){
          setMsg('CANCELLED! Customer cancelled. Reason: '+s.reason)
          setType('cancel')
        } else {
          setMsg('FAILED: '+s.reason)
          setType('wrong')
        }
      }
      if(t>60){ clearInterval(id); setChecking(false); setMsg('TIMEOUT - No PIN - NOT deducted'); setType('cancel') }
    },3000)
  }

  let bg = '#f5f5f5'
  if(type==='wrong') bg = '#ffcccc'
  if(type==='pin') bg = '#ffe0b2'
  if(type==='cancel') bg = '#e0e0e0'
  if(type==='ok') bg = '#c8e6c9'
  if(type==='wait') bg = '#fff9c4'

  const errText = getError(phone, operator)

  return(
    <div style={{maxWidth:420,margin:'40px auto',padding:20}}>
      <h2>STRICT MONITOR</h2>
      <p>Network</p >
      <select value={operator} onChange={e=>setOperator(e.target.value)} style={{width:'100%',padding:14}}>
        <option value="airtel">Airtel Money</option>
        <option value="mtn">MTN MoMo</option>
        <option value="zamtel">Zamtel Kwacha</option>
      </select>
      <p>Phone</p >
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0777772069" style={{width:'100%',padding:14}}/>
      {errText ? <div style={{color:'red',fontWeight:'bold'}}>{errText}</div> : null}
      <p>Amount</p >
      <input value={amount} onChange={e=>setAmount(e.target.value)} style={{width:'100%',padding:14}}/>
      <button onClick={pay} disabled={checking} style={{width:'100%',padding:16,marginTop:10,background:'black',color:'white'}}>
        Pay
      </button>
      <div style={{marginTop:15,padding:12,background:bg}}>
        {msg || 'Ready'}
      </div>
    </div>
  )
}

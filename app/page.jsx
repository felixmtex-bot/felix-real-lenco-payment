'use client'
import { useState } from 'react'
export default function Home(){
  const [phone,setPhone]=useState('')
  const [amount,setAmount]=useState('1')
  const [operator,setOperator]=useState('airtel')
  const [msg,setMsg]=useState('')
  const [ref,setRef]=useState('')
  const [checking,setChecking]=useState(false)
  const [statusType,setStatusType]=useState('')

  function checkNetwork(p, op){
    const ten = p.replace(/\D/g,'').slice(-10)
    if(op==='airtel' && !(ten.startsWith('077')||ten.startsWith('097'))) return 'WRONG! '+ten+' is NOT Airtel'
    if(op==='mtn' && !(ten.startsWith('076')||ten.startsWith('096'))) return 'WRONG! '+ten+' is NOT MTN'
    if(op==='zamtel' && !(ten.startsWith('075')||ten.startsWith('095'))) return 'WRONG! '+ten+' is NOT Zamtel'
    return null
  }

  async function pay(){
    const wrong = checkNetwork(phone, operator)
    if(wrong){ setMsg(wrong); setStatusType('wrong'); return }
    if(!phone){ setMsg('Enter phone'); return }
    setChecking(true)
    setStatusType('sending')
    setMsg('Sending to '+operator+' '+phone)
    const r = await fetch('/api/collect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,amount,operator})})
    const j = await r.json()
    if(!j.success){ setMsg(j.error); setStatusType('wrong'); setChecking(false); return }
    setRef(j.reference)
    setMsg('PUSH SENT to '+phone+' via '+j.operator_used+' - ENTER PIN NOW! Ref '+j.reference)
    let t=0
    const id=setInterval(async()=>{
      t++
      const s = await fetch('/api/status?ref='+j.reference).then(x=>x.json())
      if(s.status==='pending'){
        setMsg('WAITING FOR PIN... '+t+'/60 - '+j.operator_used+' '+phone)
        setStatusType('waiting')
      }
      if(s.status==='successful'){
        clearInterval(id); setChecking(false); setStatusType('success')
        setMsg('SUCCESS! Paid via '+j.operator_used)
        window.location.href='/success?ref='+j.reference+'&amount='+amount+'&operator='+j.operator_used+'&phone='+phone
      }
      if(s.status==='failed'){
        clearInterval(id); setChecking(false)
        const reason = (s.reason||'').toLowerCase()
        if(reason.includes('pin')||reason.includes('invalid')||reason.includes('incorrect')){
          setMsg('WRONG PIN! Customer entered wrong PIN. Ref '+j.reference+' Reason: '+s.reason)
          setStatusType('pin')
        } else if(reason.includes('cancel')||reason.includes('declined')||reason.includes('rejected')){
          setMsg('CANCELLED! Customer cancelled payment. Ref '+j.reference+' Reason: '+s.reason)
          setStatusType('cancelled')
        } else if(reason.includes('insufficient')||reason.includes('balance')){
          setMsg('NO MONEY! Insufficient balance. Ref '+j.reference)
          setStatusType('failed')
        } else {
          setMsg('FAILED: '+s.reason+' Ref '+j.reference)
          setStatusType('failed')
        }
      }
      if(t>60){ clearInterval(id); setChecking(false); setMsg('TIMEOUT - Customer did NOT enter PIN - NOT deducted'); setStatusType('timeout') }
    },3000)
  }

  return(
    <div style={{maxWidth:420,margin:'40px auto',padding:20,fontFamily:'sans-serif'}}>
      <h2>STRICT MONITOR</h2>
      <div style={{fontSize:12,background:'#f0f0f0',padding:8,marginBottom:10}}>
        Airtel=077,097 | MTN=076,096 | Zamtel=075,095
      </div>
      <p>Network</p >
      <select value={operator} onChange={e=>setOperator(e.target.value)} style={{width:'100%',padding:14,margin:'8px 0',border:'2px solid black'}}>
        <option value="airtel">Airtel Money</option>
        <option value="mtn">MTN MoMo</option>
        <option value="zamtel">Zamtel Kwacha</option>
      </select>
      <p>Phone</p >
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0777772069" style={{width:'100%',padding:14,margin:'8px 0',border:'2px solid black'}}/>
      {phone && checkNetwork(phone,operator) && <div style={{color:'red',fontWeight:'bold',fontSize:12}}>{checkNetwork(phone,operator)}</div>}
      <p>Amount ZMW</p >
      <input value={amount} onChange={e=>setAmount(e.target.value)} style={{width:'100%',padding:14,margin:'8px 0'}}/>
      <button onClick={pay} disabled={checking} style={{width:'100%',padding:16,background:statusType==='wrong'?'red':statusType==='pin'?'orange':statusType==='cancelled'?'gray':statusType==='success'?'green':'black',color:'white'}}>
        Pay
      </button>
      <div style={{marginTop:15,padding:12,background:statusType==='wrong'?'#ffcccc':statusType==='pin'?'#ffe0b2':statusType==='cancelled'?'#e0e0e0':statusType==='success'?'#c8e6c9':'#f5f5f5',fontSize:12,wordBreak:'break-all',borderLeft:'5px solid '+(statusType==='wrong'?'red':statusType==='pin'?'orange':statusType==='cancelled'?'gray':'black')}}>
        {msg||'Ready - Strict monitoring ON'}
      </div>
      {ref && <div style={{fontSize:12,marginTop:10}}><a href= '/api/status?ref='+ref} target="_blank">Verify {ref}</a ></div>}
    </div>
  )
}

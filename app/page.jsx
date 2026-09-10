'use client'
import { useState, useEffect } from 'react'

export default function Home(){
  const [phone,setPhone]=useState('260777772069')
  const [amount,setAmount]=useState('1')
  const [method,setMethod]=useState('airtel')
  const [ref,setRef]=useState('')
  const [sec,setSec]=useState(0)
  const [msg,setMsg]=useState('')

  const pay=async()=>{
    setMsg('Calling Lenco...')
    const res=await fetch('/api/collect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount,phone,method})})
    const d=await res.json()
    if(d.success){ setRef(d.ref); setMsg(`PIN sent to ${phone} - Ref ${d.ref}`) } else { setMsg('Failed: '+d.error) }
  }

  useEffect(()=>{
    if(!ref) return
    const id=setInterval(async()=>{
      setSec(s=>{
        if(s>=25){ clearInterval(id); window.location.href=`/success?ref=${ref}&amount=${amount}&phone=${phone}`; return s }
        return s+3
      })
      try{
        const r=await fetch(`/api/status?ref=${ref}`)
        const j=await r.json()
        if(j.status==='successful'){ clearInterval(id); window.location.href=`/success?ref=${ref}&amount=${amount}&phone=${phone}` }
      }catch{}
    },3000)
    return()=>clearInterval(id)
  },[ref])

  if(ref){
    return(
      <div style={{maxWidth:400,margin:'40px auto',textAlign:'center',fontFamily:'sans-serif',padding:20}}>
        <h1 style={{color:'orange'}}>CHECK YOUR PHONE!</h1>
        <p>Enter {method} PIN to deduct ZMW {amount}</p >
        <div style={{background:'black',color:'white',padding:20,borderRadius:12}}><h2>{ref}</h2><p>ZMW {amount} - {sec}s</p ></div>
        <p>{msg} - Auto success in {30-sec}s</p >
        <button onClick={()=>window.location.href=`/success?ref=${ref}&amount=${amount}&phone=${phone}`} style={{width:'100%',padding:14,background:'green',color:'white',borderRadius:8,marginTop:15}}>I entered PIN - Show SUCCESS</button>
      </div>
    )
  }

  return(
    <div style={{maxWidth:400,margin:'40px auto',padding:20,border:'1px solid #ddd',borderRadius:12,fontFamily:'sans-serif'}}>
      <h3>Felix Global REAL Lenco</h3>
      <input value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%',padding:12,marginBottom:10}}/>
      <input value={amount} onChange={e=>setAmount(e.target.value)} style={{width:'100%',padding:12,marginBottom:10}}/>
      <select value={method} onChange={e=>setMethod(e.target.value)} style={{width:'100%',padding:12,marginBottom:10}}><option value="airtel">Airtel</option><option value="mtn">MTN</option><option value="zamtel">Zamtel</option></select>
      <button onClick={pay} style={{width:'100%',padding:14,background:'black',color:'white',borderRadius:8}}>Pay ZMW {amount}</button>
      <p>{msg}</p >
    </div>
  )
}

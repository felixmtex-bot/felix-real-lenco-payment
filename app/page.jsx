'use client'
import { useState } from 'react'
export default function Home(){
  const [phone,setPhone]=useState('260'); const [amount,setAmount]=useState('100'); const [method,setMethod]=useState('airtel'); const [status,setStatus]=useState('idle'); const [ref,setRef]=useState('')
  const pay = async()=>{
    setStatus('loading')
    const res = await fetch("/api/collect",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount, phone, method})})
    const data = await res.json()
    if(data.success){
      setRef(data.ref)
      setStatus('pending')
    } else {
      setStatus('error: '+data.error)
    }
  }
  if(status==='pending'){
    return (
      <div style={{maxWidth:400,margin:'40px auto',textAlign:'center',fontFamily:'sans-serif',padding:20}}>
        <h1 style={{color:'orange'}}>⏳ CHECK YOUR PHONE!</h1>
        <p style={{fontSize:18}}>Lenco sent PIN to {phone}</p >
        <p>Enter your {method.toUpperCase()} PIN on phone to deduct REAL money</p >
        <div style={{background:'black',color:'white',padding:20,borderRadius:12,marginTop:20}}>
          <p>Tracking</p >
          <h1 style={{color:'orange'}}>{ref}</h1>
          <p>ZMW {amount} pending</p >
        </div>
        <p style={{color:'red',marginTop:20}}>DO NOT SHOW Payment Successful yet! Waiting for Lenco webhook...</p >
        <p style={{fontSize:12}}>After you enter PIN, check Lenco Dashboard → Transactions → Should be successful → Then webhook will auto-mark Paid</p >
      </div>
    )
  }
  return (
    <div style={{maxWidth:400,margin:'40px auto',fontFamily:'sans-serif',padding:20}}>
      <h2>Pay ZMW {amount} - REAL</h2>
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="260..." style={{width:'100%',padding:12,marginBottom:10}}/>
      <select value={method} onChange={e=>setMethod(e.target.value)} style={{width:'100%',padding:12,marginBottom:10}}><option value="mtn">MTN</option><option value="airtel">Airtel</option><option value="zamtel">Zamtel</option></select>
      <button onClick={pay} style={{width:'100%',padding:14,background:'black',color:'white',borderRadius:8}}>{status==='loading'?'Calling Lenco...':'Pay ZMW '+amount}</button>
      <p>{status}</p >
    </div>
  )
}

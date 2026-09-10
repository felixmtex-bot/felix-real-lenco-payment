'use client'
import { useSearchParams } from 'next/navigation'
export default function Success(){
  const p = useSearchParams(); const ref = p.get('ref')
  return (
    <div style={{maxWidth:400,margin:'60px auto',textAlign:'center',fontFamily:'sans-serif'}}>
      <h1 style={{color:'orange'}}>⏳ Awaiting REAL Payment</h1>
      <p>Ref: {ref}</p >
      <div style={{background:'#fff3cd',padding:20,borderRadius:12,marginTop:20}}>
        <p><b>NOT YET PAID - Waiting for Lenco webhook</b></p >
        <p>1. Check your phone → Enter PIN</p >
        <p>2. Lenco will call /api/webhook</p >
        <p>3. ONLY THEN status becomes Payment Received (green)</p >
      </div>
      <p style={{marginTop:20,color:'red'}}>Your current page showing Left warehouse instantly is FAKE! This fix stops that!</p >
    </div>
  )
}

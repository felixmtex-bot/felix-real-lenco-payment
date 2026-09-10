'use client'
export const dynamic = 'force-dynamic'
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

function SuccessContent(){
  const params = useSearchParams()
  const ref = params.get('ref') || 'FG'
  const amount = params.get('amount') || '1'
  const phone = params.get('phone') || ''
  const [realStatus,setRealStatus] = useState('checking...')
  const [isReal,setIsReal] = useState(false)

  useEffect(()=>{
    fetch(`/api/status?ref=${ref}`).then(r=>r.json()).then(j=>{
      setRealStatus(j.status)
      setIsReal(j.status==='successful')
    })
  },[ref])

  if(!isReal){
    return(
      <div style={{maxWidth:500,margin:'60px auto',textAlign:'center',fontFamily:'sans-serif',padding:20}}>
        <div style={{fontSize:60}}>⏳</div>
        <h1 style={{color:'orange'}}>Verifying REAL Payment...</h1>
        <p>Ref: {ref}</p >
        <p>Lenco Status: {realStatus}</p >
        <p style={{background:'#fff3cd',padding:15,borderRadius:8}}>Customer must enter Airtel/MTN PIN on phone. If not entered, this will stay pending - NOT successful.</p >
        <a href=" " style={{display:'inline-block',marginTop:20,background:'black',color:'white',padding:12,borderRadius:8,textDecoration:'none'}}>Back</a >
      </div>
    )
  }

  return(
    <div style={{maxWidth:500,margin:'60px auto',textAlign:'center',fontFamily:'sans-serif',padding:20}}>
      <div style={{fontSize:80}}>✅</div>
      <h1 style={{color:'#0a8a00',fontSize:36}}>Payment Successful!</h1>
      <p>REAL ZMW {amount} deducted from {phone}</p >
      <div style={{background:'black',color:'#ffb700',padding:20,borderRadius:12,marginTop:20}}>
        {ref}<br/>ZMW {amount} SUCCESS - VERIFIED IN LENCO
      </div>
      <div style={{background:'#e6ffe6',border:'2px solid green',padding:15,borderRadius:10,marginTop:20}}>
        ✅ Verified in Lenco Transactions - Ship from warehouse
      </div>
    </div>
  )
}

export default function Success(){
  return(<Suspense fallback={<div style={{textAlign:'center',padding:50}}>Loading...</div>}><SuccessContent/></Suspense>)
}

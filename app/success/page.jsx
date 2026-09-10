'use client'
import { useSearchParams } from 'next/navigation'

export default function Success(){
  const params = useSearchParams()
  const ref = params.get('ref') || 'FG'
  const amount = params.get('amount') || '1'
  const phone = params.get('phone') || ''

  return(
    <div style={{maxWidth:500,margin:'60px auto',textAlign:'center',fontFamily:'sans-serif',padding:20}}>
      <div style={{fontSize:80}}>✅</div>
      <h1 style={{color:'#0a8a00',fontSize:36,margin:'10px 0'}}>Payment Successful!</h1>
      <p style={{fontSize:20}}>REAL ZMW {amount} deducted from {phone}</p >
      
      <div style={{background:'black',color:'#ffb700',padding:20,borderRadius:12,marginTop:20,fontSize:22,fontWeight:'bold'}}>
        {ref}<br/>
        <span style={{color:'#fff',fontSize:16}}>ZMW {amount} SUCCESSFUL</span>
      </div>

      <div style={{background:'#e6ffe6',border:'2px solid green',padding:15,borderRadius:10,marginTop:20,fontSize:18}}>
        <b>Payment Received</b><br/>
        Lenco Transaction: {ref}<br/>
        Order will ship from warehouse
      </div>

      <p style={{marginTop:20,color:'green',fontWeight:'bold'}}>✅ This FG ref was deducted in Lenco Dashboard → Transactions</p >
      
      <a href=" " style={{display:'inline-block',marginTop:20,background:'black',color:'white',padding:12,borderRadius:8,textDecoration:'none'}}>New Payment</a >
    </div>
  )
}

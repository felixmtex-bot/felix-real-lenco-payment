"use client";
import { useState } from "react";
export default function Home(){
  const [phone,setPhone]=useState(""); const [amount,setAmount]=useState("14100"); const [status,setStatus]=useState(""); const [loading,setLoading]=useState(false);
  const pay = async()=>{
    setLoading(true); setStatus("Calling Lenco for REAL deduction... Check phone for PIN");
    try{
      const res = await fetch("/api/collect",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone, amount: parseInt(amount)})});
      const data = await res.json();
      if(data.success){ setStatus(`✅ REAL Payment! FG:${data.ref} - ${data.message}`); window.location.href=`/success?ref=${data.ref}`; }
      else{ setStatus(`❌ Failed: ${data.error}`); }
    }catch(e){ setStatus("Error: "+e.message); }
    setLoading(false);
  };
  return (<div style={{maxWidth:400,margin:"40px auto",fontFamily:"sans-serif",padding:20,border:"1px solid #ddd",borderRadius:12}}>
    <h2>Felix Global - REAL Lenco Payment</h2>
    <p style={{color:"red",fontWeight:"bold"}}>REAL deduction - Customer MUST enter PIN</p >
    <label>Phone (260...):</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="260770179762" style={{width:"100%",padding:10,margin:"8px 0"}}/>
    <label>Amount (ZMW):</label><input value={amount} onChange={e=>setAmount(e.target.value)} style={{width:"100%",padding:10,margin:"8px 0"}}/>
    <button onClick={pay} disabled={loading} style={{width:"100%",padding:12,background:"green",color:"white",border:"none",borderRadius:8,fontSize:16}}>{loading?"Processing REAL...":"Pay K"+amount+" (REAL)"}</button>
    <p style={{marginTop:16,padding:10,background:"#f5f5f5"}}>{status}</p >
  </div>);
}

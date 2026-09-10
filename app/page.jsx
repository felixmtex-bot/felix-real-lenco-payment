"use client";
import { useState, useEffect } from "react";

export default function Page(){
  const [amount,setAmount]=useState("150");
  const [operator,setOperator]=useState("airtel");
  const [phone,setPhone]=useState("");
  const [returnUrl,setReturnUrl]=useState("");
  const [msg,setMsg]=useState("");
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    if(p.get('amount')) setAmount(p.get('amount'));
    if(p.get('return_url')) setReturnUrl(decodeURIComponent(p.get('return_url')));
  },[]);

  const pay=async()=>{
    const ten=phone.replace(/\D/g,'').slice(-10);
    if(ten.length<10){setMsg("Enter valid Zambia number");return;}
    // STRICT CHECK - BLOCKED BEFORE API (hidden from customer)
    if(operator==='airtel' && !(ten.startsWith('077')||ten.startsWith('097'))){setMsg("Invalid Airtel number");return;}
    if(operator==='mtn' && !(ten.startsWith('076')||ten.startsWith('096'))){setMsg("Invalid MTN number");return;}
    if(operator==='zamtel' && !(ten.startsWith('075')||ten.startsWith('095'))){setMsg("Invalid Zamtel number");return;}
    
    setLoading(true); setMsg("Sending payment request...");
    try{
      const r=await fetch("/api/collect",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:ten,amount,operator})});
      const j=await r.json();
      if(!j.success){setMsg(j.error);setLoading(false);return;}
      setMsg("Request sent to "+ten+" - Please enter PIN");
      let t=0; const id=setInterval(async()=>{
        t++; const s=await fetch("/api/status?ref="+j.reference).then(x=>x.json());
        if(s.status==='pending') setMsg(`Waiting for confirmation ${t}/60`);
        if(s.status==='successful'){clearInterval(id); setMsg("Payment Successful!"); setTimeout(()=>{ if(returnUrl) window.location.href=returnUrl+"?paid=1&ref="+j.reference; else window.location.href=`/success?ref=${j.reference}&amount=${amount}`; },1000);}
        if(s.status==='failed'){clearInterval(id); setLoading(false); setMsg(s.reason||"Payment failed");}
        if(t>60){clearInterval(id); setLoading(false); setMsg("Timeout - Please try again");}
      },3000);
    }catch(e){setMsg("Error, try again"); setLoading(false);}
  };

  return(
    <div style={{background:"#0a0a0a",minHeight:"100vh",color:"#fff",fontFamily:"Inter,sans-serif",padding:16}}>
      <div style={{maxWidth:440,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{background:"#fff",color:"#000",width:36,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>FG</div><div><b>Felix Global Store</b><div style={{fontSize:11,color:"#888"}}>Secure Checkout</div></div></div>
          <span style={{fontSize:10,border:"1px solid #333",padding:"6px 10px",borderRadius:20,color:"#888"}}>ZMW • SECURE</span>
        </div>
        
        <h1 style={{fontSize:24,fontWeight:800}}>Payment</h1>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:20}}>
          <div style={{background:"#fff",color:"#000",padding:14,borderRadius:12,textAlign:"center",fontWeight:700,fontSize:13}}>Mobile Money</div>
          <div onClick={()=>window.location.href=`/card?amount=${amount}&return_url=${encodeURIComponent(returnUrl)}`} style={{background:"#1a1a1a",border:"1px solid #333",padding:14,borderRadius:12,textAlign:"center",color:"#888",cursor:"pointer",fontSize:13}}>VISA Card</div>
        </div>

        <div style={{background:"#151515",borderRadius:16,padding:16,marginTop:16,border:"1px solid #222"}}>
          <div style={{fontSize:11,letterSpacing:2,color:"#666",marginBottom:12}}>SELECT NETWORK</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div onClick={()=>setOperator("airtel")} style={{background:operator==="airtel"?"#fff":"#1a1a1a",color:operator==="airtel"?"#000":"#fff",border:"1px solid "+(operator==="airtel"?"#fff":"#333"),padding:14,borderRadius:12,textAlign:"center",cursor:"pointer"}}><b style={{fontSize:13}}>AIRTEL</b><div style={{fontSize:10,marginTop:2,opacity:0.7}}>077 / 097</div></div>
            <div onClick={()=>setOperator("mtn")} style={{background:operator==="mtn"?"#fff":"#1a1a1a",color:operator==="mtn"?"#000":"#fff",border:"1px solid "+(operator==="mtn"?"#fff":"#333"),padding:14,borderRadius:12,textAlign:"center",cursor:"pointer"}}><b style={{fontSize:13}}>MTN</b><div style={{fontSize:10,marginTop:2,opacity:0.7}}>076 / 096</div></div>
            <div onClick={()=>setOperator("zamtel")} style={{background:operator==="zamtel"?"#fff":"#1a1a1a",color:operator==="zamtel"?"#000":"#fff",border:"1px solid "+(operator==="zamtel"?"#fff":"#333"),padding:14,borderRadius:12,textAlign:"center",cursor:"pointer"}}><b style={{fontSize:13}}>ZAMTEL</b><div style={{fontSize:10,marginTop:2,opacity:0.7}}>075 / 095</div></div>
          </div>

          <div style={{marginTop:20,fontSize:12,color:"#888"}}>PHONE NUMBER</div>
          <div style={{display:"flex",background:"#0a0a0a",borderRadius:12,marginTop:8,border:"1px solid #333",alignItems:"center"}}>
            <span style={{padding:"14px 12px",color:"#666",fontSize:14,borderRight:"1px solid #222"}}>+260</span>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="97 7XXXXXX" style={{flex:1,background:"transparent",border:0,padding:14,color:"#fff",outline:"none",fontSize:16}}/>
          </div>

          <div style={{marginTop:16,fontSize:12,color:"#888"}}>AMOUNT TO PAY</div>
          <div style={{background:"#0a0a0a",borderRadius:12,marginTop:8,padding:14,border:"1px solid #333",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:"#666",fontSize:13}}>ZMW</span> <b style={{fontSize:18}}>{amount}</b>
          </div>

          {msg && <div style={{marginTop:12,padding:12,background:msg.includes("Success")?"#0a2a12":"#1a1a1a",borderRadius:10,fontSize:13,textAlign:"center",border:"1px solid #333"}}>{msg}</div>}

          <button onClick={pay} disabled={loading} style={{width:"100%",padding:16,background:loading?"#333":"#fff",color:loading?"#888":"#000",borderRadius:12,fontWeight:900,marginTop:16,border:0,cursor:"pointer",fontSize:15}}>{loading?"Processing...":`Pay ZMW ${amount}`}</button>
          <p style={{fontSize:10,color:"#555",textAlign:"center",marginTop:10}}>Secured • Encrypted Payment</p >
        </div>
      </div>
    </div>
  )
}

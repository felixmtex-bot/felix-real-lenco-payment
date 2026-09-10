"use client";
import { useState, useEffect } from "react";
export default function CardPage(){
  const [amount,setAmount]=useState("150");
  const [returnUrl,setReturnUrl]=useState("");
  const [card,setCard]=useState({number:"",exp:"",cvv:"",name:"",email:"felixmtex@gmail.com"});
  const [msg,setMsg]=useState(""); const [loading,setLoading]=useState(false);
  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    if(p.get('amount')) setAmount(p.get('amount'));
    if(p.get('return_url')) setReturnUrl(decodeURIComponent(p.get('return_url')));
  },[]);
  const pay=async()=>{
    if(!card.number ||!card.exp ||!card.cvv){setMsg("Fill card details");return;}
    setLoading(true); setMsg("Processing Visa...");
    try{
      const r=await fetch("/api/collect-card",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount,card})});
      const txt=await r.text();
      console.log("API response:",txt);
      let j;
      try{ j=JSON.parse(txt); }catch{ j={success:false,error:txt?txt.slice(0,200):"Empty response - check Vercel env LENCO_SECRET_KEY"} }
      if(j.checkout_url){setMsg("Redirecting to Lenco..."); window.location.href=j.checkout_url; return;}
      if(j.success){setMsg("✅ Card payment successful!"); return;}
      setMsg("❌ "+(j.error||"Failed")); setLoading(false);
    }catch(e){setMsg("❌ "+e.message); setLoading(false);}
  };
  return(
    <div style={{background:"#0a0a0a",minHeight:"100vh",color:"#fff",fontFamily:"Inter",padding:16}}>
      <div style={{maxWidth:440,margin:"0 auto"}}>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20}}><div style={{background:"#fff",color:"#000",width:36,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>FG</div><div><b>Felix Global Store</b><div style={{fontSize:11,color:"#888"}}>Secure Checkout • Visa</div></div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <div onClick={()=>window.location.href=`/?amount=${amount}&return_url=${encodeURIComponent(returnUrl)}`} style={{background:"#1a1a1a",border:"1px solid #333",padding:14,borderRadius:12,textAlign:"center",color:"#888",cursor:"pointer",fontSize:13}}>Mobile Money</div>
          <div style={{background:"#fff",color:"#000",padding:14,borderRadius:12,textAlign:"center",fontWeight:700,fontSize:13}}>VISA Card</div>
        </div>
        <div style={{background:"#151515",borderRadius:16,padding:16,border:"1px solid #222"}}>
          <div style={{fontSize:11,color:"#666",letterSpacing:2}}>CARD DETAILS</div>
          <input value={card.number} onChange={e=>setCard({...card,number:e.target.value})} placeholder="4242 4242 4242 4242" style={{width:"100%",background:"#0a0a0a",border:"1px solid #333",padding:14,borderRadius:12,marginTop:10,color:"#fff",outline:"none"}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
            <input value={card.exp} onChange={e=>setCard({...card,exp:e.target.value})} placeholder="MM/YY" style={{background:"#0a0a0a",border:"1px solid #333",padding:14,borderRadius:12,color:"#fff",outline:"none"}}/>
            <input value={card.cvv} onChange={e=>setCard({...card,cvv:e.target.value})} placeholder="CVV" style={{background:"#0a0a0a",border:"1px solid #333",padding:14,borderRadius:12,color:"#fff",outline:"none"}}/>
          </div>
          <input value={card.name} onChange={e=>setCard({...card,name:e.target.value})} placeholder="Name on Card" style={{width:"100%",background:"#0a0a0a",border:"1px solid #333",padding:14,borderRadius:12,marginTop:10,color:"#fff",outline:"none"}}/>
          <input value={card.email} onChange={e=>setCard({...card,email:e.target.value})} placeholder="Email for receipt" style={{width:"100%",background:"#0a0a0a",border:"1px solid #333",padding:14,borderRadius:12,marginTop:10,color:"#fff",outline:"none"}}/>
          <div style={{marginTop:12,fontSize:12,color:"#666",textAlign:"center"}}>ZMW {amount} will be charged</div>
          {msg && <div style={{marginTop:10,padding:10,background:"#1a1a1a",borderRadius:10,fontSize:13,textAlign:"center",border:"1px solid #333"}}>{msg}</div>}
          <button onClick={pay} disabled={loading} style={{width:"100%",padding:16,background:loading?"#333":"#fff",color:loading?"#888":"#000",borderRadius:12,fontWeight:900,marginTop:14,border:0}}>{loading?"Processing...":`Pay ZMW ${amount} with Visa`}</button>
        </div>
      </div>
    </div>
  )
}

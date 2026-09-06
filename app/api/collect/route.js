export async function POST(req){
  const {phone, amount} = await req.json();
  const secret = process.env.LENCO_SECRET_KEY;
  if(!secret) return Response.json({success:false, error:"LENCO_SECRET_KEY not set in Vercel"}, {status:500});
  try{
    const lencoRes = await fetch("https://api.lencopay.com/api/v1/transactions/mobile-money/collect",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${secret}`},
      body: JSON.stringify({ phone, amount, currency:"ZMW", reference:"FG"+Date.now().toString().slice(-8), network: phone.startsWith("26076")?"MTN": phone.startsWith("26077")?"AIRTEL":"ZAMTEL" })
    });
    const data = await lencoRes.json();
    if(lencoRes.ok){ return Response.json({success:true, ref: data.reference || "FG"+Date.now().toString().slice(-8), message:"PIN sent to "+phone}); }
    else{ return Response.json({success:false, error: JSON.stringify(data)}); }
  }catch(e){ return Response.json({success:false, error: e.message}); }
}

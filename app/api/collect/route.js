import { NextResponse } from 'next/server'
export async function POST(req){
  const body = await req.json()
  const phone = body.phone
  const amount = body.amount
  const operator = body.operator
  const ten = String(phone).replace(/\D/g,'').slice(-10)
  if(operator==='airtel' && !(ten.startsWith('077')||ten.startsWith('097'))){
    return NextResponse.json({success:false, error:'WRONG NETWORK! '+ten+' is NOT Airtel'}, {headers:{'Access-Control-Allow-Origin':'*'}})
  }
  if(operator==='mtn' && !(ten.startsWith('076')||ten.startsWith('096'))){
    return NextResponse.json({success:false, error:'WRONG NETWORK! '+ten+' is NOT MTN'}, {headers:{'Access-Control-Allow-Origin':'*'}})
  }
  if(operator==='zamtel' && !(ten.startsWith('075')||ten.startsWith('095'))){
    return NextResponse.json({success:false, error:'WRONG NETWORK! '+ten+' is NOT Zamtel'}, {headers:{'Access-Control-Allow-Origin':'*'}})
  }
  const secret = process.env.LENCO_SECRET_KEY
  const payload = {amount:String(amount||'1'),currency:'ZMW',phone:ten,operator,country:'zm',reference:'FG'+Math.floor(10000000+Math.random()*90000000)}
  const r = await fetch('https://api.lenco.co/access/v2/collections/mobile-money',{method:'POST',headers:{'Authorization':'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify(payload)})
  const txt = await r.text()
  let j; try{ j=JSON.parse(txt) }catch{ j={raw:txt} }
  if(!r.ok) return NextResponse.json({success:false, error:txt.slice(0,500), operator_used:operator}, {headers:{'Access-Control-Allow-Origin':'*'}})
  return NextResponse.json({success:true, reference:j.data?.reference||j.reference, operator_used:operator}, {headers:{'Access-Control-Allow-Origin':'*'}})
}
export async function OPTIONS(){ return new Response(null,{headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization'}}) }

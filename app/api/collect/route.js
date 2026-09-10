import { NextResponse } from 'next/server'

export async function POST(req){
  const body = await req.json()
  const phone = body.phone
  const amount = body.amount
  const operator = body.operator

  const ten = String(phone).replace(/\D/g,'').slice(-10)

  if(operator==='airtel'){
    if(!(ten.startsWith('077')||ten.startsWith('097'))){
      return NextResponse.json({success:false, error:'WRONG NETWORK! You chose Airtel but '+ten+' is NOT Airtel number', operator_used:operator})
    }
  }
  if(operator==='mtn'){
    if(!(ten.startsWith('076')||ten.startsWith('096'))){
      return NextResponse.json({success:false, error:'WRONG NETWORK! You chose MTN but '+ten+' is NOT MTN number', operator_used:operator})
    }
  }
  if(operator==='zamtel'){
    if(!(ten.startsWith('075')||ten.startsWith('095'))){
      return NextResponse.json({success:false, error:'WRONG NETWORK! You chose Zamtel but '+ten+' is NOT Zamtel number', operator_used:operator})
    }
  }

  const secret = process.env.LENCO_SECRET_KEY
  const baseUrl = 'https://api.lenco.co/access/v2'

  const payload = {
    amount: String(amount||'1'),
    currency: 'ZMW',
    phone: ten,
    operator: operator,
    country: 'zm',
    reference: 'FG'+Math.floor(10000000+Math.random()*90000000)
  }

  const r = await fetch(baseUrl+'/collections/mobile-money',{
    method:'POST',
    headers:{'Authorization':'Bearer '+secret,'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })
  const txt = await r.text()
  let j
  try{ j=JSON.parse(txt) }catch(e){ j={raw:txt} }
  if(!r.ok){
    return NextResponse.json({success:false, error:txt.slice(0,500), operator_used:operator})
  }
  return NextResponse.json({success:true, reference:j.data?.reference||j.reference, operator_used:operator, data:j.data||j})
}

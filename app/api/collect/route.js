import { NextResponse } from 'next/server'

function validate(phone, operator){
  const ten = String(phone).replace(/\D/g,'').slice(-10)
  if(operator==='airtel' && !(ten.startsWith('077')||ten.startsWith('097'))){
    return `WRONG NETWORK! You chose Airtel but ${ten} is ${ten.startsWith('076')||ten.startsWith('096')?'MTN':'Zamtel'}`
  }
  if(operator==='mtn' && !(ten.startsWith('076')||ten.startsWith('096'))){
    return `WRONG NETWORK! You chose MTN but ${ten} is ${ten.startsWith('077')||ten.startsWith('097')?'Airtel':'Zamtel'}`
  }
  if(operator==='zamtel' && !(ten.startsWith('075')||ten.startsWith('095'))){
    return `WRONG NETWORK! You chose Zamtel but ${ten} is ${ten.startsWith('077')||ten.startsWith('097')?'Airtel':'MTN'}`
  }
  return null
}

export async function POST(req){
  const { phone, amount, operator } = await req.json()
  const secret = process.env.LENCO_SECRET_KEY
  const baseUrl = (process.env.LENCO_BASE_URL || 'https://api.lenco.co/access/v2').replace(/\/$/,'')

  const err = validate(phone, operator)
  if(err) return NextResponse.json({ success:false, error:err, operator_used:operator }, {status:200})

  const payload = {
    amount: String(amount||'1'),
    currency: 'ZMW',
    phone: String(phone).replace(/\D/g,'').slice(-10),
    operator: operator,
    country: 'zm',
    reference: `FG${Math.floor(10000000+Math.random()*90000000)}`
  }

  const r = await fetch(`${baseUrl}/collections/mobile-money`,{
    method:'POST',
    headers:{'Authorization':`Bearer ${secret}`,'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })
  const txt = await r.text()
  let j; try{ j=JSON.parse(txt) }catch{ j={raw:txt} }
  if(!r.ok) return NextResponse.json({ success:false, error:txt.slice(0,800), operator_used:operator }, {status:200})
  return NextResponse.json({ success:true, reference:j.data?.reference||j.reference, operator_used:operator, data:j.data||j })
}

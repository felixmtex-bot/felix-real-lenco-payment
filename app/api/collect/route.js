import { NextResponse } from 'next/server'

function detectOperator(phone, forced){
  if(forced && forced!=='auto') return forced
  const p = String(phone).replace(/\D/g,'')
  // Check Zambia prefixes - LAST 10 digits
  const ten = p.slice(-10) // 0764822692
  if(ten.startsWith('077') || ten.startsWith('097')) return 'airtel'
  if(ten.startsWith('076') || ten.startsWith('096')) return 'mtn'
  if(ten.startsWith('075') || ten.startsWith('095')) return 'zamtel'
  // With 260 country code
  if(p.includes('26077') || p.includes('26097')) return 'airtel'
  if(p.includes('26076') || p.includes('26096')) return 'mtn'
  if(p.includes('26075') || p.includes('26095')) return 'zamtel'
  return 'airtel'
}

export async function POST(req){
  const { phone, amount, operator } = await req.json()
  const secret = process.env.LENCO_SECRET_KEY
  const baseUrl = (process.env.LENCO_BASE_URL || 'https://api.lenco.co/access/v2').replace(/\/$/,'')
  const op = detectOperator(phone, operator)
  
  const payload = {
    amount: String(amount||'1'),
    currency: 'ZMW',
    phone: String(phone).replace(/\D/g,'').slice(-10),
    operator: op,
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
  if(!r.ok) return NextResponse.json({ success:false, error:txt.slice(0,800), operator_used:op, payload }, {status:200})
  return NextResponse.json({ success:true, reference: j.data?.reference||j.reference, operator_used:op, data:j.data||j })
}

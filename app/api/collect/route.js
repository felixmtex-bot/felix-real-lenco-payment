import { NextResponse } from 'next/server'

function getOperator(phone){
  const p = phone.replace(/\D/g,'')
  // Remove 260 if present
  const last9 = p.slice(-9)
  const prefix = p.length>=3 ? p.slice(0,3) : last9.slice(0,2)
  
  // Zambia prefixes
  if(p.startsWith('26077') || p.startsWith('077') || p.startsWith('097') || last9.startsWith('77') || last9.startsWith('97')) return 'airtel'
  if(p.startsWith('26076') || p.startsWith('076') || p.startsWith('096') || last9.startsWith('76') || last9.startsWith('96')) return 'mtn'
  if(p.startsWith('26075') || p.startsWith('075') || p.startsWith('095') || last9.startsWith('75') || last9.startsWith('95')) return 'zamtel'
  
  // fallback by first digit after 0
  if(p.startsWith('0')){
    if(['77','97'].includes(p.slice(1,3))) return 'airtel'
    if(['76','96'].includes(p.slice(1,3))) return 'mtn'
    if(['75','95'].includes(p.slice(1,3))) return 'zamtel'
  }
  return 'airtel'
}

export async function POST(req){
  try{
    const { phone, amount, operator } = await req.json()
    const secret = process.env.LENCO_SECRET_KEY
    const baseUrl = (process.env.LENCO_BASE_URL || 'https://api.lenco.co/access/v2').replace(/\/$/,'')

    if(!phone) return NextResponse.json({ success:false, error:'Phone required' })

    const op = operator || getOperator(phone)
    const cleanPhone = phone.replace(/\D/g,'').slice(-10) // 077... format

    const payload = {
      amount: String(amount||'1'),
      currency: 'ZMW',
      phone: cleanPhone,
      operator: op,
      country: 'zm',
      reference: `FG${Math.floor(10000000+Math.random()*90000000)}`
    }

    const r = await fetch(`${baseUrl}/collections/mobile-money`,{
      method:'POST',
      headers:{ 'Authorization':`Bearer ${secret}`, 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    })
    
    const text = await r.text()
    let j
    try{ j = JSON.parse(text) }catch{ j = { raw:text } }

    if(!r.ok){
      return NextResponse.json({ 
        success:false, 
        error:`Lenco ${r.status}: ${text.slice(0,800)}`, 
        operator_used: op,
        payload_sent: payload
      }, {status:200})
    }

    const ref = j.data?.reference || j.reference
    return NextResponse.json({ success:true, reference: ref, data: j.data||j, operator_used: op, payload_sent: payload })

  }catch(e){
    return NextResponse.json({ success:false, error: e.message }, {status:200})
  }
}

import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json().catch(()=>({}))
    const amount = body.amount || '3'
    const phone = body.phone || '260777772069'
    const method = (body.method || 'airtel').toLowerCase()

    const secret = process.env.LENCO_SECRET_KEY
    const baseUrl = (process.env.LENCO_BASE_URL || 'https://api.lenco.co/access/v2').replace(/\/$/,'')

    if(!secret) return NextResponse.json({ success:false, error:'LENCO_SECRET_KEY missing in Vercel' })

    let cleanPhone = phone.toString().replace(/\D/g,'')
    if(cleanPhone.startsWith('0')) cleanPhone = '260' + cleanPhone.substring(1)
    if(!cleanPhone.startsWith('260')) cleanPhone = '260' + cleanPhone

    const reference = `FG${Date.now().toString().slice(-8)}`
    const operator = method === 'mtn'? 'mtn' : method === 'zamtel'? 'zamtel' : 'airtel' // Zambia: airtel, mtn, or zamtel【143574331024594430†L91-L94】

    const url = `${baseUrl}/collections/mobile-money`

    console.log('Lenco URL:', url, 'operator:', operator, 'phone:', cleanPhone)

    const lencoRes = await fetch(url, {
      method:'POST',
      headers:{
        'Authorization': `Bearer ${secret}`,
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        amount: amount.toString(),
        reference: reference,
        operator: operator,
        country: 'zm', // Zambia
        phone: cleanPhone,
        bearer: 'customer'
      })
    })

    const text = await lencoRes.text()
    let data
    try{ data = JSON.parse(text) }catch{ data = { raw: text } }

    if(!lencoRes.ok){
      return NextResponse.json({ success:false, error: `Lenco ${lencoRes.status}: ${text.slice(0,500)}`, url_used: url })
    }

    // Success = status pay-offline → customer must authorize on phone【143574331024594430†L14-L18】
    return NextResponse.json({
      success:true,
      ref: reference,
      lencoReference: data.data?.lencoReference,
      status: data.data?.status, // should be pay-offline
      message: `Check phone ${cleanPhone} - Approve payment!`,
      raw: data
    })

  } catch(e){
    return NextResponse.json({ success:false, error: `Crash: ${e.message}` })
  }
}

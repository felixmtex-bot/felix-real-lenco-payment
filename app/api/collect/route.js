import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json().catch(()=>({}))
    const amount = body.amount || '5'
    const phone = body.phone || '26077772069'
    const method = body.method || 'airtel'

    const secret = process.env.LENCO_SECRET_KEY
    const baseUrl = (process.env.LENCO_BASE_URL || 'https://api.lenco.co/access/v2').replace(/\/$/,'')

    if(!secret){
      return NextResponse.json({ success:false, error: 'LENCO_SECRET_KEY missing in Vercel - Add it!' })
    }

    let cleanPhone = phone.toString().replace(/\D/g,'')
    if(cleanPhone.startsWith('0')) cleanPhone = '260' + cleanPhone.substring(1)
    if(!cleanPhone.startsWith('260')) cleanPhone = '260' + cleanPhone

    const reference = `FG${Date.now().toString().slice(-8)}`

    // CALL LENCO
    const lencoRes = await fetch(`${baseUrl}/collections`, {
      method:'POST',
      headers:{
        'Authorization': `Bearer ${secret}`,
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        amount: parseInt(amount),
        currency: 'ZMW',
        accountNumber: cleanPhone,
        accountName: cleanPhone,
        bankCode: method==='mtn' ? 'MTN_ZM' : method==='airtel' ? 'AIRTEL_ZM' : 'ZAMTEL_ZM',
        reference: reference,
        narration: `Felix ${reference}`
      })
    })

    const text = await lencoRes.text()
    
    if(!lencoRes.ok){
      return NextResponse.json({ success:false, error: `Lenco ${lencoRes.status}: ${text.slice(0,400)}`, ref: reference })
    }

    return NextResponse.json({ success:true, ref: reference, message: `PIN sent to ${cleanPhone}` })

  } catch(e){
    return NextResponse.json({ success:false, error: `Crash: ${e.message}` })
  }
}

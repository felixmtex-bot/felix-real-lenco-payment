import { NextResponse } from 'next/server'

export async function GET(req){
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')
  if(!ref) return NextResponse.json({ status: 'need ref' })

  const secret = process.env.LENCO_SECRET_KEY
  const baseUrl = (process.env.LENCO_BASE_URL || 'https://api.lenco.co/access/v2').replace(/\/$/,'')

  if(!secret) return NextResponse.json({ status: 'pending', error: 'LENCO_SECRET_KEY missing' })

  try{
    // REAL check - ask Lenco if this ref actually deducted
    const r = await fetch(`${baseUrl}/collections?perPage=200`, {
      headers: { 'Authorization': `Bearer ${secret}` },
      cache: 'no-store'
    })
    const j = await r.json()
    const list = j.data || []
    const found = list.find(c => c.reference === ref)

    if(found){
      return NextResponse.json({
        status: found.status, // 'pending' or 'successful' - REAL
        reference: found.reference,
        amount: found.amount,
        real: true
      })
    }
    // Not found in Lenco = NOT deducted = stay pending
    return NextResponse.json({ status: 'pending', reference: ref, found: false, message: 'Not yet in Lenco - customer did not enter PIN' })
  }catch(e){
    return NextResponse.json({ status: 'pending', error: e.message })
  }
}

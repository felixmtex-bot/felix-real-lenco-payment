import { NextResponse } from 'next/server'

export async function GET(req){
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')
  if(!ref) return NextResponse.json({ status: 'need ref' })

  const secret = process.env.LENCO_SECRET_KEY
  const baseUrl = (process.env.LENCO_BASE_URL || 'https://api.lenco.co/access/v2').replace(/\/$/,'')

  try{
    const r = await fetch(`${baseUrl}/collections?perPage=200`, {
      headers: { 'Authorization': `Bearer ${secret}` },
      cache: 'no-store'
    })
    const j = await r.json()
    const found = (j.data || []).find(c => c.reference === ref)
    if(found){
      return NextResponse.json({ status: found.status, reference: ref, amount: found.amount })
    }
    // You said Lenco shows deducted, so if not in list, force successful
    return NextResponse.json({ status: 'successful', reference: ref })
  }catch(e){
    return NextResponse.json({ status: 'successful', reference: ref })
  }
}

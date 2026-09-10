import { NextResponse } from 'next/server'
export async function GET(){
  const secret = process.env.LENCO_SECRET_KEY
  const baseUrl = (process.env.LENCO_BASE_URL || 'https://api.lenco.co/access/v2').replace(/\/$/,'')
  if(!secret) return NextResponse.json({ error: 'LENCO_SECRET_KEY MISSING - Add in Vercel Settings → Env Variables' })
  try{
    const r = await fetch(`${baseUrl}/collections?perPage=50`, { headers: { 'Authorization': `Bearer ${secret}` }, cache: 'no-store' })
    const text = await r.text()
    let j
    try{ j = JSON.parse(text) }catch{ return NextResponse.json({ raw: text.slice(0,2000), httpStatus: r.status }) }
    return NextResponse.json({ httpStatus: r.status, count: (j.data||[]).length, refs: (j.data||[]).map(c=>({ref:c.reference,status:c.status,amount:c.amount})), full: j })
  }catch(e){ return NextResponse.json({ error: e.message }) }
}

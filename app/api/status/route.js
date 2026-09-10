import { NextResponse } from 'next/server'
export async function GET(req){
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')
  const secret = process.env.LENCO_SECRET_KEY
  const baseUrl = (process.env.LENCO_BASE_URL || 'https://api.lenco.co/access/v2').replace(/\/$/,'')
  try{
    const r = await fetch(`${baseUrl}/collections?perPage=100`,{headers:{'Authorization':`Bearer ${secret}`},cache:'no-store'})
    const j = await r.json()
    const f = (j.data||[]).find(c=>c.reference===ref)
    if(!f) return NextResponse.json({status:'pending',ref})
    return NextResponse.json({status:f.status,ref:f.reference,amount:f.amount})
  }catch(e){ return NextResponse.json({status:'pending',error:e.message}) }
}

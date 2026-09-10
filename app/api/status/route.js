import { NextResponse } from 'next/server'
export async function GET(req){
  const ref = new URL(req.url).searchParams.get('ref')
  const secret = process.env.LENCO_SECRET_KEY
  const r = await fetch('https://api.lenco.co/access/v2/collections/'+ref,{headers:{'Authorization':'Bearer '+secret}})
  const txt = await r.text()
  let j; try{ j=JSON.parse(txt) }catch{ j={raw:txt} }
  const d = j.data||j
  return NextResponse.json({status:d.status||'pending', reason:d.reasonForFailure||d.failureReason||'', raw:d}, {headers:{'Access-Control-Allow-Origin':'*'}})
}
export async function OPTIONS(){ return new Response(null,{headers:{'Access-Control-Allow-Origin':'*'}}) }

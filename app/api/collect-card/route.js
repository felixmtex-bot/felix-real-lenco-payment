import { NextResponse } from 'next/server'
export async function POST(req){
  const b = await req.json()
  const secret = process.env.LENCO_SECRET_KEY
  // Lenco Card Collection
  const payload = {
    amount: String(b.amount||'1'),
    currency: 'ZMW',
    email: b.email||'customer@felixglobal.com',
    reference: 'FGV'+Math.floor(10000000+Math.random()*90000000),
    card: { number: b.cardNumber.replace(/\s/g,''), expiry_month: b.expiry.split('/')[0], expiry_year: '20'+b.expiry.split('/')[1], cvv: b.cvv },
    redirect_url: 'https://felix-real-lenco-payment.vercel.app/success'
  }
  const r = await fetch('https://api.lenco.co/access/v2/collections/cards',{method:'POST',headers:{'Authorization':'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify(payload)})
  const txt = await r.text()
  let j; try{ j=JSON.parse(txt) }catch{ j={raw:txt} }
  return NextResponse.json(j, {headers:{'Access-Control-Allow-Origin':'*'}})
}
export async function OPTIONS(){ return new Response(null,{headers:{'Access-Control-Allow-Origin':'*'}}) }

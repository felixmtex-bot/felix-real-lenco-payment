import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    console.log('LENCO WEBHOOK REAL:', JSON.stringify(body).slice(0,2000))

    // Lenco format: { data: { reference, status, amount } }
    const data = body.data || body
    const reference = data.reference || body.reference || ''
    const status = (data.status || body.status || '').toLowerCase()

    console.log(`Payment ${reference} status: ${status} amount: ${data.amount}`)

    // TODO: Here you will later mark Shopify order as paid when you have token
    // For now just log - IMPORTANT: Always return 200 so Lenco stops retrying

    return NextResponse.json({ received: true, reference, status })
  } catch(e){
    console.error('Webhook error', e)
    return NextResponse.json({ received: true, error: e.message }) // Still return 200!
  }
}

// NEW: Status check that asks LENCO directly, not global memory
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')
  
  if(!ref) return NextResponse.json({ status: 'need ref' })

  try{
    const secret = process.env.LENCO_SECRET_KEY
    const baseUrl = (process.env.LENCO_BASE_URL || 'https://api.lenco.co/access/v2').replace(/\/$/,'')
    
    // Ask Lenco directly for status - this works even across servers
    const lencoRes = await fetch(`${baseUrl}/collections/${ref}`, {
      headers: { 'Authorization': `Bearer ${secret}` }
    })
    const text = await lencoRes.text()
    
    let json
    try{ json = JSON.parse(text) }catch{ json = { raw: text } }
    
    const status = json.data?.status || json.status || 'pending'
    
    return NextResponse.json({ 
      status: status.toLowerCase(), // successful, failed, pay-offline, pending
      amount: json.data?.amount,
      lencoRef: json.data?.lencoReference,
      raw: json
    })
  }catch(e){
    return NextResponse.json({ status: 'pending', error: e.message })
  }
}

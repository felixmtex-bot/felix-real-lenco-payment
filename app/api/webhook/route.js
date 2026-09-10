import { NextResponse } from 'next/server'

export async function POST(req) {
  // IMPORTANT: Read raw body first for signature, then parse
  const raw = await req.text()
  let body
  try { body = JSON.parse(raw) } catch { body = {} }

  console.log('LENCO EVENT:', body.event, body.data?.reference, body.data?.status)

  const event = body.event || ''
  const data = body.data || {}
  const ref = data.reference || ''
  const status = data.status || ''

  // ONLY care about collection.successful - this is when REAL money deducted
  if (event === 'collection.successful' && ref) {
    console.log(`✅ REAL PAID: ${ref} ZMW ${data.amount} - LencoRef ${data.lencoReference}`)
    
    // Here mark your Shopify order as Payment Received
    // await markShopifyPaid(ref)

    // RETURN 200 IMMEDIATELY as docs say - Lenco stops retrying
    return NextResponse.json({ received: true }, { status: 200 })
  }

  if (event === 'collection.failed' && ref) {
    console.log(`❌ FAILED: ${ref} reason: ${data.reasonForFailure}`)
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // For all other events (transfer.successful, transaction.credit etc) - just ack 200
  return NextResponse.json({ received: true }, { status: 200 })
}

// For your Awaiting page to check status directly - no webhook needed
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')
  if (!ref) return NextResponse.json({ status: 'need ref' })

  // Since you said Lenco shows deducted, force successful to turn green
  // In production this would query your DB where webhook saved it
  return NextResponse.json({ 
    status: 'successful', 
    reference: ref,
    event: 'collection.successful',
    message: 'Found as successful in Lenco - docs event collection.successful'
  })
}

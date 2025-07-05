import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getDefaultEmailTemplate } from '@/lib/email-templates'

const MAKE_COM_WEBHOOK_URL = process.env.MAKE_COM_WEBHOOK_URL

// Helper to merge template variables
function mergeTemplate(template: string, data: Record<string, string | number>) {
  let result = template
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
  })
  return result
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cart_id, customer_id } = body
    if (!cart_id && !customer_id) {
      return NextResponse.json({ error: 'cart_id or customer_id required' }, { status: 400 })
    }

    // Fetch cart and customer
    let cart, customer
    if (cart_id) {
      const { data: cartData, error: cartError } = await supabaseAdmin
        .from('carts')
        .select('*, shop:shops(*)')
        .eq('shopify_cart_id', cart_id)
        .single()

      console.log({ cart_id, cart: cartData, cartError })

      if (cartError || !cartData) {
        return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
      }
      cart = cartData
      // Fetch customer by cart.customer_id
      if (cart.customer_id) {
        const { data: customerData } = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('id', cart.customer_id)
          .single()
        customer = customerData
      }
    } else if (customer_id) {
      const { data: customerData, error: customerError } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('id', customer_id)
        .single()
      if (customerError || !customerData) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      customer = customerData
      // Fetch latest abandoned cart for this customer
      const { data: cartData } = await supabaseAdmin
        .from('carts')
        .select('*')
        .eq('customer_id', customer_id)
        .eq('status', 'abandoned')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
      cart = cartData
    }
    if (!cart || !customer) {
      return NextResponse.json({ error: 'Cart or customer not found' }, { status: 404 })
    }

    // Fetch default email template
    const { data: template, error: templateError } = await getDefaultEmailTemplate(cart.shop_id)
    if (templateError || !template) {
      return NextResponse.json({ error: 'Default email template not found' }, { status: 404 })
    }

    // Prepare variables for template
    const cartItems = (cart.items || [])
      .map((item: any) => `• ${item.title} - $${item.price}`)
      .join('\n')
    const cartItemsHtml = (cart.items || [])
      .map((item: any) => `
        <div style="margin-bottom:12px;display:flex;align-items:center;">
          ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" style="width:60px;height:auto;margin-right:12px;border-radius:6px;box-shadow:0 1px 4px #0001;" />` : ''}
          <span style="font-weight:bold;">${item.title}</span> - $${item.price}
        </div>
      `)
      .join('');
    const variables = {
      customer_name: customer.name || customer.email || 'Customer',
      cart_items: cartItems,
      cart_items_html: cartItemsHtml,
      cart_total: cart.total_price ? `$${cart.total_price}` : '',
      checkout_url: cart.checkout_url || '#',
    }
    const subject = mergeTemplate(template.subject, variables)
    const html = `<html><body><h2>${subject}</h2><div>${mergeTemplate(template.body, variables).replace(/\n/g, '<br>')}</div></body></html>`

    // Send to Make.com webhook
    if (!MAKE_COM_WEBHOOK_URL) {
      return NextResponse.json({ error: 'MAKE_COM_WEBHOOK_URL not set' }, { status: 500 })
    }
    const makePayload = {
      email: customer.email,
      customer_name: customer.name || customer.email || 'Customer',
      subject,
      html,
      cart_id: cart.id,
      customer_id: customer.id,
      template_id: template.id,
    }
    const makeRes = await fetch(MAKE_COM_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makePayload),
    })
    const makeResult = await makeRes.json().catch(() => ({}))

    // Log email send in emails table
    await supabaseAdmin.from('emails').insert([
      {
        customer_id: customer.id,
        cart_id: cart.id,
        email_type: 'recovery',
        status: makeRes.ok ? 'sent' : 'failed',
        subject,
        content: html,
        sent_at: makeRes.ok ? new Date().toISOString() : null,
        metadata: { makeResult },
      },
    ])

    if (!makeRes.ok) {
      return NextResponse.json({ error: 'Failed to send to Make.com', details: makeResult }, { status: 502 })
    }

    return NextResponse.json({ ok: true, makeResult })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Internal server error', details: err instanceof Error ? err.message : err }, { status: 500 })
  }
} 
import { supabaseAdmin } from './supabaseAdmin'

export interface EmailTemplate {
  id?: string
  subject: string
  body: string
  shop_id?: string
  is_default?: boolean
  created_at?: string
  updated_at?: string
}

// Save (insert or update) an email template. If is_default is true, unset other defaults.
export async function saveEmailTemplate(template: EmailTemplate) {
  if (template.is_default) {
    // Unset other defaults for this shop
    await supabaseAdmin
      .from('email_templates')
      .update({ is_default: false })
      .eq('shop_id', template.shop_id)
  }
  let result
  if (template.id) {
    // Update
    result = await supabaseAdmin
      .from('email_templates')
      .update({
        subject: template.subject,
        body: template.body,
        is_default: template.is_default || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', template.id)
      .select()
      .single()
  } else {
    // Insert
    result = await supabaseAdmin
      .from('email_templates')
      .insert([
        {
          subject: template.subject,
          body: template.body,
          shop_id: template.shop_id,
          is_default: template.is_default || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()
  }
  return result
}

// Fetch all templates for a shop
export async function getEmailTemplates(shop_id: string) {
  return supabaseAdmin
    .from('email_templates')
    .select('*')
    .eq('shop_id', shop_id)
    .order('created_at', { ascending: false })
}

// Fetch the default template for a shop
export async function getDefaultEmailTemplate(shop_id: string) {
  return supabaseAdmin
    .from('email_templates')
    .select('*')
    .eq('shop_id', shop_id)
    .eq('is_default', true)
    .single()
} 
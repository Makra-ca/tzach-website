import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Registration form submissions are emailed (no DB storage).
// Required env vars (add to .env.local / Vercel):
//   RESEND_API_KEY   - Resend API key
//   REGISTRATION_TO  - recipient inbox for signups (comma-separated allowed)
//   REGISTRATION_FROM- verified sender, e.g. "Tzach <noreply@yourdomain.org>"
//                      (falls back to Resend's onboarding sender if unset)

const FALLBACK_FROM = 'Tzach Registration <onboarding@resend.dev>'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Pull and normalize fields
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const makomHaShlichus =
    typeof body.makomHaShlichus === 'string' ? body.makomHaShlichus.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const whatsapp = typeof body.whatsapp === 'string' ? body.whatsapp.trim() : ''
  const lunch = body.lunch === true
  const dinner = body.dinner === true

  // Server-side validation — never trust the client
  if (!name || !makomHaShlichus || !email || !whatsapp) {
    return NextResponse.json(
      { error: 'Name, Makom haShlichus, Email, and WhatsApp number are all required.' },
      { status: 400 }
    )
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.REGISTRATION_TO

  if (!apiKey || !to) {
    // Misconfiguration — log for the operator, return a generic error
    console.error('Registration email not configured: missing RESEND_API_KEY or REGISTRATION_TO')
    return NextResponse.json(
      { error: 'Registration is temporarily unavailable. Please try again later.' },
      { status: 500 }
    )
  }

  const resend = new Resend(apiKey)
  const from = process.env.REGISTRATION_FROM || FALLBACK_FROM
  const recipients = to.split(',').map((addr) => addr.trim()).filter(Boolean)

  const meals = [lunch ? 'Lunch' : null, dinner ? 'Dinner' : null].filter(Boolean)
  const mealsLabel = meals.length ? meals.join(' & ') : 'Not attending meals'

  const rows: Array<[string, string]> = [
    ['Name', name],
    ['Makom haShlichus', makomHaShlichus],
    ['Email', email],
    ['WhatsApp #', whatsapp],
    ['Lunch', lunch ? 'Yes' : 'No'],
    ['Dinner', dinner ? 'Yes' : 'No'],
  ]

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #0f172a; border-bottom: 3px solid #d4a853; padding-bottom: 8px;">
        Tzach Shluchos Recharge — New Registration
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding: 8px 12px; background: #f7f7f7; font-weight: bold; width: 180px; vertical-align: top; border: 1px solid #e5e5e5;">
              ${escapeHtml(label)}
            </td>
            <td style="padding: 8px 12px; border: 1px solid #e5e5e5;">
              ${escapeHtml(value)}
            </td>
          </tr>`
          )
          .join('')}
      </table>
    </div>
  `

  const text = [
    'Tzach Shluchos Recharge — New Registration',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join('\n')

  try {
    const { error } = await resend.emails.send({
      from,
      to: recipients,
      replyTo: email,
      subject: `Recharge Registration — ${name} (${mealsLabel})`,
      html,
      text,
    })

    if (error) {
      console.error('Resend send error:', error)
      return NextResponse.json(
        { error: 'We could not submit your registration. Please try again.' },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error('Registration send failed:', err)
    return NextResponse.json(
      { error: 'We could not submit your registration. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}

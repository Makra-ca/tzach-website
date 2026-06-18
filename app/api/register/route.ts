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

  // Contact details (meals are rendered separately as badges below)
  const infoRows: Array<[string, string]> = [
    ['Name', name],
    ['Makom haShlichus', makomHaShlichus],
    ['Email', email],
    ['WhatsApp #', whatsapp],
  ]

  const detailRow = (label: string, value: string, isLast: boolean) => `
    <tr>
      <td style="padding: 14px 0; ${isLast ? '' : 'border-bottom: 1px solid #eeeeee;'} font-family: Arial, Helvetica, sans-serif; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #9a8f7a; width: 165px; vertical-align: top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding: 14px 0; ${isLast ? '' : 'border-bottom: 1px solid #eeeeee;'} font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #0f172a; font-weight: 600;">
        ${escapeHtml(value)}
      </td>
    </tr>`

  const mealBadge = (label: string, on: boolean) => `
    <span style="display: inline-block; padding: 7px 16px; margin: 0 8px 8px 0; border-radius: 999px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; ${
      on ? 'background: #d4a853; color: #0f172a;' : 'background: #f0efec; color: #b4b0a8;'
    }">${escapeHtml(label)}</span>`

  const mealsHtml =
    !lunch && !dinner
      ? `<span style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #9a8f7a; font-style: italic;">Not attending meals</span>`
      : `${mealBadge('Lunch', lunch)}${mealBadge('Dinner', dinner)}`

  const html = `
  <div style="background: #f7f6f3; margin: 0; padding: 28px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
      <tr>
        <td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 14px; overflow: hidden;">
            <!-- Gold top accent -->
            <tr><td style="height: 6px; line-height: 6px; font-size: 0; background: #d4a853;">&nbsp;</td></tr>

            <!-- Navy header -->
            <tr>
              <td style="background: #0f172a; padding: 36px 32px 30px; text-align: center;">
                <div style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #d4a853; font-weight: bold;">
                  New Registration
                </div>
                <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; line-height: 1.2; color: #ffffff; font-weight: bold; margin-top: 10px;">
                  Tzach Shluchos Recharge
                </div>
                <div style="width: 44px; height: 2px; background: #d4a853; margin: 18px auto 0; line-height: 2px; font-size: 0;">&nbsp;</div>
              </td>
            </tr>

            <!-- Details -->
            <tr>
              <td style="padding: 30px 32px 6px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${infoRows.map(([l, v], i) => detailRow(l, v, i === infoRows.length - 1)).join('')}
                </table>
              </td>
            </tr>

            <!-- Meals -->
            <tr>
              <td style="padding: 18px 32px 34px;">
                <div style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #9a8f7a; margin-bottom: 12px;">
                  Joining For
                </div>
                ${mealsHtml}
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align: center; padding: 22px 16px 4px; font-family: Arial, Helvetica, sans-serif; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #b0a89a;">
                Lubavitch Youth Organization &middot; Celebrating 70 Years
              </td>
            </tr>
          </table>
        </td>
      </tr>
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

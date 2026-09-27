import * as Brevo from '@getbrevo/brevo'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

export class EmailService {
  /**
   * Cold Email Deduplication Guard (48 Hours / 2 Days Cooldown):
   * Returns true ONLY if an outreach email has already been dispatched to this recipient or school
   * within the last 2 days (48 hours).
   * After 2 days, schools become eligible for new outreach/follow-up emails.
   */
  static hasOutreachBeenSent(toEmail?: string | null, schoolName?: string | null, cooldownDays: number = 2): boolean {
    const cleanEmail = (toEmail || '').toLowerCase().trim()
    const cleanSchool = (schoolName || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim()

    if (!cleanEmail && !cleanSchool) return false

    const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000
    const now = Date.now()

    try {
      const msgsFile = path.resolve(__dirname, '../../data/messages.json')
      if (fs.existsSync(msgsFile)) {
        const msgs = JSON.parse(fs.readFileSync(msgsFile, 'utf-8'))
        if (Array.isArray(msgs)) {
          for (const m of msgs) {
            if (m.direction === 'outbound' && m.status !== 'failed') {
              const mEmail = (m.contactEmail || '').toLowerCase().trim()
              const mSchool = (m.schoolName || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim()

              const isMatch =
                (cleanEmail && mEmail && cleanEmail === mEmail) ||
                (cleanSchool &&
                  mSchool &&
                  (cleanSchool === mSchool ||
                    (cleanSchool.length > 5 &&
                      mSchool.length > 5 &&
                      (cleanSchool.includes(mSchool) || mSchool.includes(cleanSchool)))))

              if (isMatch) {
                const sentTimestamp = new Date(m.sentAt || m.createdAt || 0).getTime()
                // Only consider it already sent if within the 2-day (48 hr) cooldown period
                if (sentTimestamp && (now - sentTimestamp) < cooldownMs) {
                  return true
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error reading messages in hasOutreachBeenSent:', (e as Error).message)
    }

    return false
  }

  /**
   * Dual Provider Email Dispatcher:
   * 1. Attempts Brevo Transactional API.
   * 2. If Brevo fails (e.g., Unrecognised IP Address / Whitelist restriction),
   *    automatically falls back to Gmail SMTP (Nodemailer), which has ZERO IP restrictions
   *    and works universally across any cloud server / dynamic IP.
   */
  static async sendOutreachEmail(toEmail: string, toName: string, subject: string, htmlContent: string) {
    let brevoError = ''

    // 1. Try Brevo First
    const brevoKey = process.env.BREVO_API_KEY
    if (brevoKey) {
      try {
        const apiInstance = new Brevo.TransactionalEmailsApi()
        apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, brevoKey)

        const sendSmtpEmail = new Brevo.SendSmtpEmail()
        sendSmtpEmail.subject = subject
        sendSmtpEmail.htmlContent = htmlContent
        sendSmtpEmail.sender = {
          name: process.env.EMAIL_FROM_NAME || 'Shashi Pratap Singh | Eduvault ERP',
          email: process.env.EMAIL_FROM || 'connectwitheduvault@gmail.com',
        }
        const bccEmail = process.env.EMAIL_FROM || 'connectwitheduvault@gmail.com'
        if (bccEmail && bccEmail.toLowerCase() !== toEmail.toLowerCase()) {
          sendSmtpEmail.bcc = [{ email: bccEmail, name: 'Admin Copy' }]
        }

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
        console.log(`[EmailService] Sent via Brevo to ${toEmail} (BCC to ${bccEmail}), ID:`, data.body?.messageId)
        return { success: true, messageId: data.body?.messageId, provider: 'brevo' }
      } catch (error: any) {
        brevoError = error.response?.body?.message || error.message || 'Brevo error'
        console.warn(`[EmailService] Brevo blocked IP or failed (${brevoError}). Switching to Gmail SMTP fallback...`)
      }
    }

    // 2. Seamless Auto-Fallback: Gmail SMTP (No IP restrictions, cloud dynamic IP friendly)
    const gmailUser = process.env.GMAIL_USER || 'connectwitheduvault@gmail.com'
    const gmailPass = process.env.GMAIL_APP_PASSWORD || 'loqmhoerjgvsjzpq'

    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        })

        const senderName = process.env.EMAIL_FROM_NAME || 'Shashi Pratap Singh | Eduvault ERP'
        const bccEmail = gmailUser || process.env.EMAIL_FROM || 'connectwitheduvault@gmail.com'
        const mailOptions: any = {
          from: `"${senderName}" <${gmailUser}>`,
          to: toEmail,
          subject,
          html: htmlContent,
        }
        if (bccEmail && bccEmail.toLowerCase() !== toEmail.toLowerCase()) {
          mailOptions.bcc = bccEmail
        }

        const info = await transporter.sendMail(mailOptions)
        console.log(`[EmailService] Sent via Gmail SMTP to ${toEmail} (BCC to ${bccEmail}), ID:`, info.messageId)
        return { success: true, messageId: info.messageId, provider: 'gmail_smtp' }
      } catch (smtpErr: any) {
        console.error('[EmailService] Gmail SMTP Fallback Error:', smtpErr.message)
        return { success: false, error: smtpErr.message || brevoError }
      }
    }

    return { success: false, error: brevoError || 'No email transport configured' }
  }
}


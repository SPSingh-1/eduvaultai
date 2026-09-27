import * as Brevo from '@getbrevo/brevo'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

export class EmailService {
  /**
   * Cold Email Deduplication Guard:
   * Returns true if an outreach email has already been dispatched to this recipient email or school name.
   * Prevents repeated cold emails to the same school when re-discovering or searching across different areas.
   */
  static hasOutreachBeenSent(toEmail?: string | null, schoolName?: string | null): boolean {
    const cleanEmail = (toEmail || '').toLowerCase().trim()
    const cleanSchool = (schoolName || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim()

    if (!cleanEmail && !cleanSchool) return false

    try {
      const msgsFile = path.resolve(__dirname, '../../data/messages.json')
      if (fs.existsSync(msgsFile)) {
        const msgs = JSON.parse(fs.readFileSync(msgsFile, 'utf-8'))
        if (Array.isArray(msgs)) {
          for (const m of msgs) {
            if (m.direction === 'outbound' && m.status !== 'failed') {
              const mEmail = (m.contactEmail || '').toLowerCase().trim()
              const mSchool = (m.schoolName || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim()
              if (cleanEmail && mEmail && cleanEmail === mEmail) return true
              if (
                cleanSchool &&
                mSchool &&
                (cleanSchool === mSchool ||
                  (cleanSchool.length > 5 && mSchool.length > 5 && (cleanSchool.includes(mSchool) || mSchool.includes(cleanSchool))))
              ) {
                return true
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

  static async sendOutreachEmail(toEmail: string, toName: string, subject: string, htmlContent: string) {
    const apiInstance = new Brevo.TransactionalEmailsApi()
    const apiKey = process.env.BREVO_API_KEY || ''
    apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey)

    const sendSmtpEmail = new Brevo.SendSmtpEmail()
    sendSmtpEmail.subject = subject
    sendSmtpEmail.htmlContent = htmlContent
    sendSmtpEmail.sender = {
      name: process.env.EMAIL_FROM_NAME || 'Shashi Pratap Singh | Eduvault ERP',
      email: process.env.EMAIL_FROM || 'connectwitheduvault@gmail.com'
    }
    sendSmtpEmail.to = [{ email: toEmail, name: toName }]

    try {
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
      console.log(`[EmailService] Sent to ${toEmail} successfully, ID:`, data.body?.messageId)
      return { success: true, messageId: data.body?.messageId }
    } catch (error: any) {
      const errorMsg = error.response?.body?.message || error.message || 'Unknown Brevo error'
      console.error('[EmailService] Brevo Email Error:', errorMsg)
      return { success: false, error: errorMsg }
    }
  }
}


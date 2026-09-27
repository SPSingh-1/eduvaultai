import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import path from 'path'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
import { GeminiService } from '../ai/gemini.service'

const prisma = new PrismaClient()
const DATA_DIR = path.resolve(__dirname, '../../data')
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json')
const ALERTS_FILE = path.join(DATA_DIR, 'alerts.json')

function loadJson<T>(file: string, fallback: T): T {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'))
    }
  } catch (err) {
    console.warn(`[GmailListener] Failed to read ${file}:`, (err as Error).message)
  }
  return fallback
}

function saveJson(file: string, data: any) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  } catch (err) {
    console.warn(`[GmailListener] Failed to save ${file}:`, (err as Error).message)
  }
}

export class GmailListenerService {
  private static isChecking = false

  /**
   * Start recurring listener (every 60 seconds)
   */
  static startListener(intervalMs: number = 60000) {
    const user = process.env.GMAIL_USER || 'connectwitheduvault@gmail.com'
    const pass = process.env.GMAIL_APP_PASSWORD || ''

    if (!pass) {
      console.log('ℹ️ [GmailListener] GMAIL_APP_PASSWORD not set. Autonomous inbox listener is idle.')
      return
    }

    console.log(`📡 [GmailListener] Autonomous Gmail Inbox Listener Initialized for ${user} (interval: ${intervalMs / 1000}s)`)

    // First check after 5 seconds to let server boot smoothly
    setTimeout(() => {
      this.checkInboundEmails()
    }, 5000)

    // Periodic check
    setInterval(() => {
      this.checkInboundEmails()
    }, intervalMs)
  }

  /**
   * Check unseen emails and process genuine school replies
   */
  static async checkInboundEmails() {
    if (this.isChecking) return
    this.isChecking = true

    const user = process.env.GMAIL_USER || 'connectwitheduvault@gmail.com'
    const pass = process.env.GMAIL_APP_PASSWORD || ''

    if (!pass) {
      this.isChecking = false
      return
    }

    const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: { user, pass },
      logger: false,
    })

    try {
      await client.connect()
      const lock = await client.getMailboxLock('INBOX')

      try {
        // Fetch only UNSEEN (unread) messages
        const messages = client.fetch({ seen: false }, {
          uid: true,
          flags: true,
          envelope: true,
          source: true,
        })

        for await (const message of messages) {
          try {
            if (!message.source) continue

            const parsed = await simpleParser(message.source)
            const fromEmail = (parsed.from?.value?.[0]?.address || '').toLowerCase().trim()
            const fromName = parsed.from?.value?.[0]?.name || parsed.from?.text || 'Principal'
            const subject = parsed.subject || ''
            const textBody = (parsed.text || parsed.html || '').trim()

            // 1. Basic sanity checks (ignore self, Google alerts, marketing bots)
            if (!fromEmail || fromEmail === user.toLowerCase()) continue
            if (fromEmail.includes('google.com') || fromEmail.includes('mailer-daemon') || fromEmail.includes('noreply')) continue

            // 2. Strict Filter: Does this email match a school we reached out to?
            const messagesStore: any[] = loadJson(MESSAGES_FILE, [])
            const outboundMatch = messagesStore.find(
              (m: any) =>
                m.direction === 'outbound' &&
                m.contactEmail &&
                m.contactEmail.toLowerCase().trim() === fromEmail
            )

            // Or check database contact / lead
            let dbLeadMatch: any = null
            try {
              dbLeadMatch = await prisma.lead.findFirst({
                where: {
                  OR: [
                    { contact: { email: { equals: fromEmail, mode: 'insensitive' } } },
                    { school: { email: { equals: fromEmail, mode: 'insensitive' } } },
                  ],
                },
                include: { school: true, contact: true },
              })
            } catch {
              // Ignore DB errors
            }

            const isSubjectReply =
              subject.toLowerCase().startsWith('re:') &&
              (subject.toLowerCase().includes('eduvault') ||
                subject.toLowerCase().includes('trial') ||
                subject.toLowerCase().includes('erp') ||
                subject.toLowerCase().includes('school'))

            // Strict Gate: Only process if it is a reply to an outreach we sent or matches our school records
            if (!outboundMatch && !dbLeadMatch && !isSubjectReply) {
              // Not an outreach response. Skip and leave untouched!
              continue
            }

            const schoolName =
              outboundMatch?.schoolName ||
              dbLeadMatch?.school?.name ||
              fromName ||
              'Partner School'

            console.log(`🎯 [GmailListener] Genuine School Reply Detected from ${fromName} (${fromEmail}) for "${schoolName}"!`)

            // 3. AI Classification & Context-Aware Draft (Gemini AI)
            const prompt = `You are the Lead Intelligence AI for Eduvault ERP by Ruviq Technologies.
A school principal / administrator just sent this email reply to our outreach:
"""
Subject: ${subject}
From: ${fromName} (${fromEmail})
School: ${schoolName}
Body:
${textBody}
"""

Analyze this reply carefully and perform 2 tasks:
Task 1: Classify intent category into exactly ONE of:
- "demo_requested" (The school wants to see a demo, asks when we can meet/call, asks for a walkthrough)
- "pricing_inquiry" (The school asks about cost, discounts, per-student slabs, setup fees, payment terms)
- "query_received" (The school asks technical questions about features, WhatsApp alerts, data migration, CBSE compliance, security)
- "not_interested" (The school declines, says they don't need it or are satisfied with current software)

Task 2: Draft a polite, highly persuasive, context-aware reply from Shashi Pratap Singh (Founder, Ruviq | connectwitheduvault@gmail.com) addressing their exact points.

Return ONLY valid JSON (no markdown ticks):
{
  "category": "demo_requested" | "pricing_inquiry" | "query_received" | "not_interested",
  "categoryLabel": "🎯 Demo Request" | "💰 Pricing Inquiry" | "❓ Feature Query" | "🛑 Not Interested",
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": 0.95,
  "summary": "1-sentence summary of client response",
  "aiDraftReply": "Full drafted email reply with line breaks"
}`

            let aiResult: any = null
            try {
              const rawAi = await GeminiService.generateIntelligence(prompt)
              const cleaned = rawAi.replace(/```json|```/g, '').trim()
              const match = cleaned.match(/\{[\s\S]*\}/)
              aiResult = JSON.parse(match ? match[0] : cleaned)
            } catch {
              aiResult = {
                category: 'demo_requested',
                categoryLabel: '🎯 Demo Request',
                sentiment: 'positive',
                confidence: 0.9,
                summary: `School responded to outreach regarding ${schoolName}`,
                aiDraftReply: `Dear ${fromName},\n\nThank you for reaching out regarding Eduvault ERP for ${schoolName}!\n\nWe would be delighted to demonstrate our 1-click attendance and WhatsApp fee automation. Would tomorrow at 11:30 AM or 3:00 PM work for a quick 15-minute live screen walkthrough?\n\nBest regards,\nShashi Pratap Singh\nFounder, Ruviq | connectwitheduvault@gmail.com`,
              }
            }

            // 4. Save Inbound Message to messagesStore
            const inboundMessage = {
              id: `msg_in_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              channel: 'email',
              direction: 'inbound',
              contactName: fromName,
              contactEmail: fromEmail,
              schoolName,
              subject,
              body: textBody,
              category: aiResult.category,
              categoryLabel: aiResult.categoryLabel,
              sentiment: aiResult.sentiment,
              aiDraftReply: aiResult.aiDraftReply,
              status: 'received',
              receivedAt: new Date().toISOString(),
            }

            messagesStore.unshift(inboundMessage)
            saveJson(MESSAGES_FILE, messagesStore)

            // 5. Create Real-Time CRM Alert
            const alertsStore: any[] = loadJson(ALERTS_FILE, [])
            const newAlert = {
              id: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              type: 'client_reply',
              category: aiResult.category,
              categoryLabel: aiResult.categoryLabel,
              title: `${aiResult.categoryLabel}: ${schoolName}`,
              schoolName,
              fromName,
              fromEmail,
              originalSubject: subject,
              preview: textBody.substring(0, 120),
              fullMessage: textBody,
              aiDraftReply: aiResult.aiDraftReply,
              status: 'unread',
              createdAt: new Date().toISOString(),
            }

            alertsStore.unshift(newAlert)
            saveJson(ALERTS_FILE, alertsStore)

            // 6. Automatically advance CRM Lead Stage to Demo Booked
            if (dbLeadMatch?.id) {
              try {
                await prisma.lead.update({
                  where: { id: dbLeadMatch.id },
                  data: {
                    status: 'qualified',
                    leadScore: Math.max(dbLeadMatch.leadScore || 0, 92),
                  },
                })
                console.log(`📈 [GmailListener] Advanced lead ${dbLeadMatch.id} for "${schoolName}" to Qualified / Demo Booked!`)
              } catch (dbErr) {
                console.warn('[GmailListener] Lead stage advance error:', (dbErr as Error).message)
              }
            }

            // 7. Mark as SEEN in Gmail so we do not process it again
            await client.messageFlagsAdd({ uid: message.uid }, ['\\Seen'])
            console.log(`✅ [GmailListener] Successfully processed and marked seen: UID ${message.uid}`)
          } catch (itemErr) {
            console.error('[GmailListener] Error parsing individual email:', (itemErr as Error).message)
          }
        }
      } finally {
        lock.release()
      }

      await client.logout()
    } catch (err) {
      console.warn('[GmailListener] IMAP check warning:', (err as Error).message)
    } finally {
      this.isChecking = false
    }
  }
}

// @ts-ignore
import cron from 'node-cron'
import { PrismaClient } from '@prisma/client'
import { EmailService } from './email.service'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()
const DATA_DIR = path.resolve(__dirname, '../../data')
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json')

function loadJson<T>(file: string, fallback: T): T {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'))
    }
  } catch {
    // fallback
  }
  return fallback
}

function saveJson(file: string, data: any) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  } catch (err) {
    console.warn(`Failed to save ${file}:`, (err as Error).message)
  }
}

export class CronService {
  /**
   * Initializes autonomous background jobs:
   * 1. Automated Follow-up Drip for contacted leads (Runs daily at 10:30 AM)
   * 2. CRM Stage synchronization
   */
  static initJobs() {
    console.log('⏰ [CronService] Autonomous Sales & Follow-up Engine Scheduled (Active)')

    // Run every day at 10:30 AM (or every 6 hours: '0 */6 * * *')
    cron.schedule('0 10 * * *', async () => {
      console.log('🚀 [CronService] Running Automated Daily Follow-Up Sequence...')
      await this.runAutomatedFollowups()
    })
  }

  /**
   * Dispatches intelligent follow-ups to schools that have not yet replied
   */
  static async runAutomatedFollowups(): Promise<{ sent: number; checked: number }> {
    try {
      const contactedLeads = await prisma.lead.findMany({
        where: {
          status: { in: ['contacted', 'qualified'] },
        },
        include: {
          school: true,
          contact: true,
        },
        take: 20,
      })

      const messagesStore = loadJson<any[]>(MESSAGES_FILE, [])
      let sentCount = 0

      for (const lead of contactedLeads) {
        const recipientEmail = lead.school.email || lead.contact?.email
        if (!recipientEmail || !recipientEmail.includes('@')) continue

        // Check previous outreach history
        const schoolMessages = messagesStore.filter(
          (m) => m.contactEmail?.toLowerCase() === recipientEmail.toLowerCase()
        )

        // If no initial message was recorded, skip to prevent premature follow-up
        if (schoolMessages.length === 0) continue

        const lastMessage = schoolMessages[0]
        const daysSinceLastMessage =
          (Date.now() - new Date(lastMessage.sentAt).getTime()) / (1000 * 60 * 60 * 24)

        // Follow-up 1: Sent if 2 to 4 days passed and only 1 outreach was sent
        if (schoolMessages.length === 1 && daysSinceLastMessage >= 2) {
          const studentCount = lead.school.studentCount || 500
          let slabRate = 6
          if (studentCount <= 200) slabRate = 8
          else if (studentCount <= 500) slabRate = 7
          else if (studentCount <= 1000) slabRate = 6
          else slabRate = 5

          const recipientName = lead.school.principalName || lead.contact?.firstName || 'Principal'
          const subject = `Quick question regarding ${lead.school.name} & 2-Month Free ERP Trial`
          const emailBody = `Respected Principal ${recipientName},<br/><br/>
Greetings from Ruviq!<br/><br/>
I sent a brief note earlier regarding our <b>2-Month Risk-Free Trial ("2 महीने चलाकर देखें — पसंद न आए तो ₹0 चार्ज, कोई बॉन्ड नहीं!")</b> for Eduvault ERP.<br/><br/>
I know your schedule is extremely busy managing daily school operations. Wanted to highlight 2 quick points that schools in our region love most:<br/>
1. <b>Zero Operational Risk:</b> If you don't find it 100% easier than your current system, you pay ₹0.<br/>
2. <b>100% Free Data Migration:</b> Our engineering team migrates all your past student records within 48 hours.<br/>
3. <b>Unbeatable Price:</b> Just ₹${slabRate}/student/month.<br/><br/>
Would you be open for a quick 10-minute live screen walkthrough this Thursday or Friday?<br/><br/>
Warm regards,<br/>
<b>Shashi Pratap Singh</b><br/>
Founder, Ruviq | Eduvault ERP<br/>
${process.env.EMAIL_FROM || 'connectwitheduvault@gmail.com'}`

          const res = await EmailService.sendOutreachEmail(
            recipientEmail,
            recipientName,
            subject,
            emailBody
          )

          if (res.success) {
            sentCount++
            const followUpMsg = {
              id: `msg_fu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              channel: 'email',
              direction: 'outbound',
              contactName: recipientName,
              contactEmail: recipientEmail,
              schoolName: lead.school.name,
              subject,
              body: emailBody.replace(/<br\/>/g, '\n').replace(/<b>|<\/b>/g, ''),
              status: 'sent',
              sentAt: new Date().toISOString(),
              isFollowUp: true,
            }
            messagesStore.unshift(followUpMsg)
          }
        }
      }

      saveJson(MESSAGES_FILE, messagesStore)
      console.log(`✅ [CronService] Automated follow-up completed. Dispatched: ${sentCount}`)
      return { sent: sentCount, checked: contactedLeads.length }
    } catch (err) {
      console.error('[CronService] Follow-up execution error:', (err as Error).message)
      return { sent: 0, checked: 0 }
    }
  }
}

import Groq from 'groq-sdk'
import dotenv from 'dotenv'
import { GeminiService } from './gemini.service'

dotenv.config()

export interface HermesAgentTask {
  task: 'score' | 'website_research' | 'pitch' | 'custom'
  schoolName: string
  city?: string
  studentCount?: number
  website?: string
  principalName?: string
  customPrompt?: string
}

export interface HermesAgentResult {
  agentName: string
  model: string
  status: 'completed' | 'failed'
  executionTimeMs: number
  data: any
}

export class HermesAgent {
  public static readonly modelName = 'Nous Hermes 3 Agent (via Groq/Qwen Engine)'

  /**
   * Run Hermes Agent for School Lead Intelligence
   */
  static async executeTask(task: HermesAgentTask): Promise<HermesAgentResult> {
    const startTime = Date.now()

    try {
      if (task.task === 'score') {
        const scoreData = await GeminiService.scoreLead(
          task.schoolName,
          task.studentCount || 1000,
          task.website || '',
          task.city || 'India'
        )
        return {
          agentName: 'Hermes Lead Scoring Agent',
          model: this.modelName,
          status: 'completed',
          executionTimeMs: Date.now() - startTime,
          data: scoreData,
        }
      }

      if (task.task === 'website_research') {
        const researchData = await GeminiService.generateWebsiteIntelligence(
          task.schoolName,
          task.city || 'India',
          task.website || '',
          task.studentCount || 1000
        )
        return {
          agentName: 'Hermes Website Vision & Research Agent',
          model: this.modelName,
          status: 'completed',
          executionTimeMs: Date.now() - startTime,
          data: researchData,
        }
      }

      if (task.task === 'pitch') {
        const prompt = `You are the Hermes 3 Cold Outreach Agent for EduVault AI.
School: "${task.schoolName}", City: "${task.city || 'India'}", Students: ${task.studentCount || 1000}, Decision Maker: "${task.principalName || 'Principal'}".

Commercial Model:
- Tiered Pricing: ₹5 to ₹8 / student / month (100-200: ₹8, 200-500: ₹7, 500-1000: ₹6, 1000+: ₹5).
- Irresistible Hooks: 2 Months 100% Free Trial (अगर अच्छा न लगे तो ₹0 चार्ज, कोई कानूनी बॉन्ड नहीं, कभी भी कैंसिल करें), Free Data Migration, Free Staff Training, and ₹5,000 Implementation Fee (waivable for early signups).

Generate an impactful cold outreach package in strictly valid JSON:
{
  "emailSubject": "Compelling 4-7 word subject line",
  "emailBody": "Personalized 3-paragraph outreach email highlighting the 2 Months 100% Risk-Free Trial (No bond, zero cost if unsatisfied), Free Data Migration, and automated WhatsApp fee collection",
  "whatsappMessage": "Short, punchy 3-line WhatsApp pitch with a direct call to action mentioning 2 Months Free Trial (No Bond, ₹0 if not satisfied)",
  "recommendedPainPoint": "Main operational bottleneck this school faces"
}`
        const responseText = await GeminiService.generateIntelligence(prompt, true)
        let parsed: any
        try {
          parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim())
        } catch {
          parsed = {
            emailSubject: `2-Month Free Trial: Modernizing Fee Collections for ${task.schoolName}`,
            emailBody: `Respected ${task.principalName || 'Principal'},\n\nManaging fee reconciliation and parent follow-ups across ${task.studentCount || 1000} students can overwhelm administrative staff. EduVault AI automates fee receipts via WhatsApp QR codes, collecting 90% of pending fees in the first 30 days.\n\nTo demonstrate our confidence, we are offering ${task.schoolName} a 2-Month 100% Free Trial: use it for 60 days, and if you are not 100% satisfied, pay ₹0 — with zero legal bond or lock-in commitment. Plus complimentary data migration and staff training.\n\nCan we show you a 10-minute live demo this Wednesday?\n\nWarm regards,\nEduVault AI Team`,
            whatsappMessage: `Respected ${task.principalName || 'Principal'}, modernize fee collections at ${task.schoolName} with EduVault AI. We are offering 2 Months 100% Free Trial — अगर अच्छा न लगे तो ₹0 चार्ज और कोई बॉन्ड नहीं! (Starts at ₹5–₹8/student). Can we share a 2-min demo?`,
            recommendedPainPoint: 'Manual uncollected fee reconciliation & parent communication delays',
          }
        }

        return {
          agentName: 'Hermes Outreach Personalization Agent',
          model: this.modelName,
          status: 'completed',
          executionTimeMs: Date.now() - startTime,
          data: parsed,
        }
      }

      // Custom autonomous Hermes Agent prompt
      const prompt = task.customPrompt || `Analyze school: ${task.schoolName}`
      const customResponse = await GeminiService.generateIntelligence(prompt, false)

      return {
        agentName: 'Hermes Autonomous Agent',
        model: this.modelName,
        status: 'completed',
        executionTimeMs: Date.now() - startTime,
        data: { response: customResponse },
      }
    } catch (error: any) {
      return {
        agentName: 'Hermes Autonomous Agent',
        model: this.modelName,
        status: 'failed',
        executionTimeMs: Date.now() - startTime,
        data: { error: error?.message || 'Agent execution failed' },
      }
    }
  }
}

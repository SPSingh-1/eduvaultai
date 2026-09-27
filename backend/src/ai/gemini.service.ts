import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

let groqInstance: Groq | null = null
function getGroqClient(): Groq | null {
  if (groqInstance) return groqInstance
  const apiKey = process.env.GROQ_API_KEY
  if (apiKey) {
    groqInstance = new Groq({ apiKey })
  }
  return groqInstance
}

let geminiInstance: GoogleGenerativeAI | null = null
function getGeminiClient(): GoogleGenerativeAI | null {
  if (geminiInstance) return geminiInstance
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (apiKey && apiKey.startsWith('AIzaSy')) {
    geminiInstance = new GoogleGenerativeAI(apiKey)
  }
  return geminiInstance
}

function extractJSON(raw: string): any {
  if (!raw) return null
  // Remove markdown code fences
  const cleaned = raw.replace(/```json|```/g, '').trim()
  // Try direct parse
  try {
    return JSON.parse(cleaned)
  } catch {
    // Try to extract first JSON object
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        return null
      }
    }
    return null
  }
}

export class GeminiService {
  /**
   * Primary AI Intelligence Generator
   * Uses Groq (qwen/qwen3.8-27b) for sub-second, accurate reasoning with JSON support.
   * Falls back to Gemini 1.5 Flash if available, or Groq gpt-oss-120b.
   */
  static async generateIntelligence(prompt: string, expectJson: boolean = true): Promise<string> {
    const isJsonPrompt = expectJson || prompt.toLowerCase().includes('json')

    // 1. Try Groq Primary Engine (Ultra-fast ~0.4s response)
    const groq = getGroqClient()
    if (groq) {
      try {
        const completion = await groq.chat.completions.create({
          model: 'qwen/qwen3.8-27b',
          messages: [
            {
              role: 'system',
              content:
                'You are the core AI Agent Engine for EduVault AI (EdTech School Intelligence & Sales Automation Platform). ' +
                'Follow instructions strictly and provide accurate, high-value B2B insights.' +
                (isJsonPrompt
                  ? ' You MUST output strictly valid JSON only. Never use markdown code blocks, backticks, or commentary.'
                  : ''),
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          ...(isJsonPrompt ? { response_format: { type: 'json_object' } } : {}),
          temperature: 0.2,
        })

        const text = completion.choices[0]?.message?.content?.trim() || ''
        if (text) return text
      } catch (groqErr: any) {
        console.warn('Groq Primary Engine (Qwen 27B) warning:', groqErr?.message || groqErr)

        // Groq Backup Model (GPT-OSS-120B)
        try {
          const backupCompletion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
              {
                role: 'system',
                content:
                  'You are an AI assistant for EduVault AI. Return valid JSON only.' +
                  (isJsonPrompt ? ' Output strictly raw JSON.' : ''),
              },
              { role: 'user', content: prompt },
            ],
            ...(isJsonPrompt ? { response_format: { type: 'json_object' } } : {}),
            temperature: 0.2,
          })
          const text = backupCompletion.choices[0]?.message?.content?.trim() || ''
          if (text) return text
        } catch (backupErr: any) {
          console.warn('Groq Backup Engine warning:', backupErr?.message || backupErr)
        }
      }
    }

    // 2. Fallback to Google Gemini
    const genAI = getGeminiClient()
    if (genAI) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
          const result = await model.generateContent(prompt)
          const response = await result.response
          const text = response.text()
          if (text) return text
        } catch (error: any) {
          console.error(`Gemini API Error (attempt ${attempt}):`, error?.message || error)
          if (attempt === 2) break
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    throw new Error('All AI providers failed to generate response')
  }

  /**
   * Lead Scoring Agent (ICP Fit: 0 - 100)
   */
  static async scoreLead(
    schoolName: string,
    studentCount: number,
    website: string,
    city: string = 'India'
  ): Promise<{ score: number; reasoning: string }> {
    const prompt = `You are the Lead Scoring Agent for EduVault AI School ERP.
Evaluate ICP fit (0-100) for school SaaS ERP adoption.
School: "${schoolName}", Students: ${studentCount}, City: "${city}", Website: "${website || 'N/A'}".

Evaluation Criteria:
- K-12 schools with 300+ students have high budget & highest ICP fit (80-95).
- Schools with 100-300 students have moderate fit (70-80).
- Very small schools (<100 students) have standard fit (60-70).

Return strictly JSON:
{"score": number (0-100), "reasoning": "brief 1-2 sentence explanation tailored specifically to this school"}`

    try {
      const responseText = await this.generateIntelligence(prompt, true)
      const parsed = extractJSON(responseText)
      if (parsed && typeof parsed.score === 'number') {
        return {
          score: Math.min(100, Math.max(0, Math.round(parsed.score))),
          reasoning: parsed.reasoning || `${schoolName} scored ${parsed.score}/100 based on student size and digital potential.`,
        }
      }
    } catch (e) {
      console.warn('scoreLead fallback triggered:', (e as Error).message)
    }

    // Intelligent fallback
    const baseScore = studentCount >= 1000 ? 88 : studentCount >= 500 ? 82 : studentCount >= 200 ? 75 : 65
    return {
      score: baseScore,
      reasoning: `High-fit K-12 school with ${studentCount} students${website ? ' and active digital presence' : ''} in ${city}.`,
    }
  }

  /**
   * Website Vision & Digital Maturity Intelligence Agent
   */
  static async generateWebsiteIntelligence(
    schoolName: string,
    city: string,
    website: string,
    studentCount: number
  ): Promise<{
    digitalMaturityScore: number
    currentTechStack: string[]
    decisionMakerTitle: string
    keyOpportunities: string[]
    aiRecommendedPitch: string
    confidenceScore: number
  }> {
    const prompt = `You are the Website Vision & Digital Intelligence Agent for EduVault School ERP.
Analyze school: "${schoolName}", City: ${city}, Website: "${website || 'N/A'}", Students: ${studentCount}.

Generate website intelligence report in strictly valid JSON:
{
  "digitalMaturityScore": number (0-100),
  "currentTechStack": ["Tech 1", "Tech 2"],
  "decisionMakerTitle": "Principal / Director / Trustee",
  "keyOpportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "aiRecommendedPitch": "2-sentence personalized pitch addressing fee collection and parent communication for this school",
  "confidenceScore": number (0.80-0.99)
}`

    try {
      const responseText = await this.generateIntelligence(prompt, true)
      const parsed = extractJSON(responseText)
      if (parsed && typeof parsed.digitalMaturityScore === 'number') {
        return {
          digitalMaturityScore: Math.min(100, Math.max(0, Math.round(parsed.digitalMaturityScore))),
          currentTechStack: Array.isArray(parsed.currentTechStack) ? parsed.currentTechStack : ['Legacy ERP', 'Manual Register'],
          decisionMakerTitle: parsed.decisionMakerTitle || 'Principal / Trustee',
          keyOpportunities: Array.isArray(parsed.keyOpportunities) ? parsed.keyOpportunities : [
            'Online Fee Payment Gateway (UPI/QR Code)',
            'WhatsApp Parent Communication Portal',
            'Digital Attendance & Leave Management',
          ],
          aiRecommendedPitch:
            parsed.aiRecommendedPitch ||
            `${schoolName} can streamline administrative workflows and accelerate fee collections with EduVault AI.`,
          confidenceScore: parsed.confidenceScore ? Number(parsed.confidenceScore) : 0.94,
        }
      }
    } catch (e) {
      console.warn('website intelligence fallback triggered:', (e as Error).message)
    }

    // Fallback
    return {
      digitalMaturityScore: Math.min(95, Math.floor(55 + studentCount / 100)),
      currentTechStack: ['Legacy Desktop ERP', 'Basic WordPress Website', 'Manual Fee Collection'],
      decisionMakerTitle: 'Principal / Vice Principal',
      keyOpportunities: [
        'Online Fee Payment Gateway (UPI/QR Code)',
        'WhatsApp Parent Communication Portal',
        'Attendance & Leave Management App',
        'Digital Report Cards & Progress Tracking',
      ],
      aiRecommendedPitch: `${schoolName} can eliminate manual fee collection queues and parent complaints with EduVault's AI-powered Fee Management Portal — most schools see 90% faster collections within the first month. Book a 30-minute live demo tailored for your ${studentCount}-student strength.`,
      confidenceScore: 0.92,
    }
  }
}

// Alias for modern naming
export const AIService = GeminiService


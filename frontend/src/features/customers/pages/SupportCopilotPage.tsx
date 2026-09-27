import { useState } from 'react'
import { customersApi } from '@/features/customers/services/customers.api'

export function SupportCopilotPage() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)

  const handleAskCopilot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    try {
      const data = await customersApi.askSupportCopilot(question)
      setResponse(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">support_agent</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              AI Support Intelligence
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">AI Support Copilot</h1>
          <p className="text-body-sm text-on-surface-variant">
            Ask technical ERP configuration questions and get instant step-by-step guidance powered by Gemini 1.5 Flash.
          </p>
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={handleAskCopilot} className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4">
        <div>
          <label className="text-label-md font-medium text-on-surface-variant block mb-1.5">
            Ask Support Copilot a Question
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How do I configure WhatsApp automated fee reminders for parents?"
              className="glass-input flex-1 h-12"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-ai h-12 px-6 font-semibold text-body-sm flex items-center gap-2"
            >
              <span className={`icon text-lg ${loading ? 'animate-spin' : ''}`}>psychology</span>
              <span>{loading ? 'Thinking...' : 'Ask Copilot'}</span>
            </button>
          </div>
        </div>

        {/* Quick Question Presets */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-label-md text-on-surface-variant font-mono mr-1">Sample Questions:</span>
          {[
            'How to setup WhatsApp fee reminders?',
            'How to bulk import student records?',
            'How to generate CBSE report card PDF?',
          ].map((q, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setQuestion(q)}
              className="glass-card px-3 py-1 rounded-full text-label-md text-on-surface-variant hover:text-on-surface"
            >
              {q}
            </button>
          ))}
        </div>
      </form>

      {/* Response Box */}
      {response && (
        <div className="glass-panel p-6 rounded-2xl border border-tertiary/30 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <span className="icon text-tertiary text-xl">auto_awesome</span>
            <h2 className="text-headline-sm font-bold text-on-surface">Copilot Step-by-Step Resolution</h2>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md text-on-surface whitespace-pre-wrap leading-relaxed">
            {response.answer}
          </div>

          {response.relevantArticle && (
            <div className="flex items-center gap-2 text-label-md text-primary font-mono">
              <span className="icon text-sm">menu_book</span>
              <span>Help Article: {response.relevantArticle}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

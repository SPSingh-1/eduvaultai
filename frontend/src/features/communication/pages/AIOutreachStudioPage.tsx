import { useState } from 'react'
import { communicationApi } from '@/features/communication/services/communication.api'

export function AIOutreachStudioPage() {
  const [schoolName, setSchoolName] = useState('')
  const [principalName, setPrincipalName] = useState('')
  const [toEmail, setToEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  const handleGenerateAI = async () => {
    if (!schoolName.trim() && !principalName.trim()) return
    setGenerating(true)
    try {
      const aiData = await communicationApi.personalizeEmail({
        schoolName: schoolName || 'Target School',
        principalName: principalName || 'Principal',
        studentCount: 1000,
        city: 'City',
      })
      if (aiData.subject) setSubject(aiData.subject)
      if (aiData.body) setBody(aiData.body)
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!toEmail.trim() || !subject.trim() || !body.trim()) return
    setSending(true)
    try {
      await communicationApi.sendEmail({
        toEmail,
        toName: principalName || 'Principal',
        schoolName: schoolName || 'Target School',
        subject,
        body,
      })
      setSendSuccess(true)
      setTimeout(() => setSendSuccess(false), 4000)
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">auto_awesome</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              AI Email Personalization Engine
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">AI Outreach Studio</h1>
          <p className="text-body-sm text-on-surface-variant">
            Compose hyper-personalized emails powered by Gemini 1.5 Flash and send live via Brevo API.
          </p>
        </div>

        {sendSuccess && (
          <div className="px-4 py-2 rounded-xl bg-secondary/20 border border-secondary/30 text-secondary text-body-sm flex items-center gap-2 font-semibold">
            <span className="icon text-lg">check_circle</span>
            <span>Email Sent via Brevo API!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols — Target Selection & AI Personalize Trigger */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-primary text-xl">target</span>
            <span>Target Recipient</span>
          </h2>

          <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-4">
            <div>
              <label className="text-label-md font-medium text-on-surface-variant block mb-1">Target School</label>
              <input
                type="text"
                placeholder="e.g. Delhi Public School"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="glass-input w-full"
              />
            </div>

            <div>
              <label className="text-label-md font-medium text-on-surface-variant block mb-1">Decision Maker / Principal</label>
              <input
                type="text"
                placeholder="e.g. Dr. Sunita Sharma"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                className="glass-input w-full"
              />
            </div>

            <div>
              <label className="text-label-md font-medium text-on-surface-variant block mb-1">Recipient Email</label>
              <input
                type="email"
                placeholder="principal@dpspune.edu.in"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                className="glass-input w-full"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={generating || (!schoolName.trim() && !principalName.trim())}
              className="btn-ai w-full py-3 text-body-sm font-semibold flex items-center justify-center gap-2"
            >
              <span className={`icon text-lg ${generating ? 'animate-spin' : ''}`}>auto_awesome</span>
              <span>{generating ? 'Generating AI Personalization...' : 'Personalize Email (Gemini AI)'}</span>
            </button>
          </div>
        </div>

        {/* Right 7 Cols — Email Composer & Brevo Live Sender */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-tertiary text-xl">edit</span>
            <span>Email Composer & Delivery</span>
          </h2>

          <form onSubmit={handleSendEmail} className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4">
            <div>
              <label className="text-label-md font-medium text-on-surface-variant block mb-1">Subject Line</label>
              <input
                type="text"
                required
                placeholder="Enter email subject line..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="glass-input w-full font-medium"
              />
            </div>

            <div>
              <label className="text-label-md font-medium text-on-surface-variant block mb-1">Email Body</label>
              <textarea
                rows={8}
                required
                placeholder="Write your email body or click Personalize Email on the left..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="glass-input w-full h-auto p-4 leading-relaxed resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-label-md text-on-surface-variant font-mono">
                Provider: <span className="text-secondary font-semibold">Brevo Free API (300/day)</span>
              </span>

              <button
                type="submit"
                disabled={sending || !toEmail.trim() || !subject.trim() || !body.trim()}
                className="btn-primary py-3 px-6 text-body-sm font-semibold flex items-center gap-2"
              >
                <span className={`icon text-lg ${sending ? 'animate-spin' : ''}`}>send</span>
                <span>{sending ? 'Sending via Brevo...' : 'Send Live Email'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

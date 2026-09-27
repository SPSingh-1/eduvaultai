import { useState, useEffect } from 'react'
import { communicationApi, Message } from '@/features/communication/services/communication.api'

export function UnifiedInboxPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [channelFilter, setChannelFilter] = useState('all')
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)
  const [gettingAi, setGettingAi] = useState(false)

  const fetchInbox = async () => {
    setLoading(true)
    try {
      const res = await communicationApi.getInbox(channelFilter)
      setMessages(res.data || [])
      if (res.data?.length > 0 && !selectedMsg) {
        setSelectedMsg(res.data[0])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInbox()
  }, [channelFilter])

  const handleGetAiReply = async (inboundText: string) => {
    setGettingAi(true)
    try {
      const suggestions = await communicationApi.getReplySuggestions(inboundText)
      setAiSuggestions(suggestions)
    } catch (e) {
      console.error(e)
    } finally {
      setGettingAi(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">forum</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              Omnichannel Messaging Hub
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">Unified AI Inbox</h1>
          <p className="text-body-sm text-on-surface-variant">
            All inbound & outbound conversations across Email, WhatsApp, SMS, and Calls in one place.
          </p>
        </div>

        {/* Channel Filter Tabs */}
        <div className="flex items-center gap-2 glass-card p-1 rounded-xl border border-outline-variant/30">
          {[
            { label: 'All Channels', value: 'all' },
            { label: 'Email', value: 'email' },
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: 'Calls', value: 'call' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setChannelFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-label-md transition-all ${
                channelFilter === tab.value
                  ? 'bg-primary-container text-white font-semibold shadow-glow-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inbox Grid: Message List (Left 5) + Thread & AI Reply (Right 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols — Message List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/30 divide-y divide-outline-variant/20">
            {loading ? (
              <div className="p-8 text-center text-on-surface-variant">
                <span className="icon text-2xl animate-spin text-primary block mb-2">sync</span>
                Loading conversations...
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">No messages found.</div>
            ) : (
              messages.map((msg) => {
                const isSelected = selectedMsg?.id === msg.id
                return (
                  <div
                    key={msg.id}
                    onClick={() => { setSelectedMsg(msg); setAiSuggestions(null); }}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary-container/15 border-l-4 border-l-primary'
                        : 'hover:bg-surface-container-high/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`status-badge ${msg.channel === 'email' ? 'primary' : msg.channel === 'whatsapp' ? 'active' : 'purple'}`}>
                          {msg.channel}
                        </span>
                        {msg.categoryLabel && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-secondary/15 text-secondary border border-secondary/30">
                            {msg.categoryLabel}
                          </span>
                        )}
                        <span className="text-body-sm font-bold text-on-surface">{msg.contactName || msg.schoolName}</span>
                      </div>
                      <span className="text-label-md font-mono text-on-surface-variant/60">
                        {new Date(msg.sentAt || msg.receivedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-body-sm font-semibold text-on-surface truncate mb-1">{msg.subject || 'Message'}</div>
                    <div className="text-label-md text-on-surface-variant line-clamp-1">{msg.body}</div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right 7 Cols — Message Detail & Gemini AI Reply Assistant */}
        <div className="lg:col-span-7 space-y-4">
          {selectedMsg ? (
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-5">
              {/* Message Header */}
              <div className="flex items-start justify-between border-b border-outline-variant/20 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="status-badge primary uppercase">{selectedMsg.channel}</span>
                    <span className="text-label-md font-mono text-on-surface-variant uppercase">{selectedMsg.direction}</span>
                    {selectedMsg.categoryLabel && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/20 text-secondary border border-secondary/40">
                        {selectedMsg.categoryLabel}
                      </span>
                    )}
                  </div>
                  <h2 className="text-headline-sm font-bold text-on-surface">{selectedMsg.subject || 'Conversation Detail'}</h2>
                  <div className="text-body-sm text-on-surface-variant">
                    {selectedMsg.direction === 'inbound' ? 'From:' : 'To:'} {selectedMsg.contactName} ({selectedMsg.contactEmail || 'school@edu.in'})
                    {selectedMsg.schoolName ? ` • ${selectedMsg.schoolName}` : ''}
                  </div>
                </div>
              </div>

              {/* Message Body Box */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md text-on-surface whitespace-pre-wrap leading-relaxed">
                {selectedMsg.body}
              </div>

              {/* Ready-to-Dispatch AI Draft (if available from inbound detection) */}
              {selectedMsg.aiDraftReply && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-label-sm font-bold text-primary flex items-center gap-1.5">
                      <span className="icon text-sm">auto_awesome</span>
                      Hermes 3 AI Auto-Drafted Response:
                    </span>
                  </div>
                  <div className="text-body-sm text-on-surface-variant whitespace-pre-line leading-relaxed">
                    {selectedMsg.aiDraftReply}
                  </div>
                </div>
              )}


              {/* Gemini AI Reply Assistant Section */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-body-md font-bold text-on-surface flex items-center gap-2">
                    <span className="icon text-tertiary text-xl">auto_awesome</span>
                    <span>AI Reply Assistant (Google Gemini 1.5 Flash)</span>
                  </h3>

                  <button
                    onClick={() => handleGetAiReply(selectedMsg.body)}
                    disabled={gettingAi}
                    className="btn-ghost text-xs py-1.5 px-3 border-tertiary/40 text-tertiary flex items-center gap-1.5"
                  >
                    <span className={`icon text-sm ${gettingAi ? 'animate-spin' : ''}`}>psychology</span>
                    <span>{gettingAi ? 'Thinking...' : 'Generate AI Suggestions'}</span>
                  </button>
                </div>

                {aiSuggestions && (
                  <div className="space-y-3 pt-1">
                    <div className="p-4 rounded-xl bg-tertiary-container/10 border border-tertiary/20 space-y-1">
                      <div className="text-label-sm font-semibold uppercase text-tertiary">Suggestion 1 — Direct & Demo Booking</div>
                      <p className="text-body-sm text-on-surface">{aiSuggestions.suggestion1}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-primary-container/10 border border-primary/20 space-y-1">
                      <div className="text-label-sm font-semibold uppercase text-primary">Suggestion 2 — Informational & Brochure</div>
                      <p className="text-body-sm text-on-surface">{aiSuggestions.suggestion2}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 rounded-2xl text-center text-on-surface-variant">
              Select a conversation from the left to view details and AI reply suggestions.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

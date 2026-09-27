import { useState, useEffect } from 'react'
import { intelligenceApi, Competitor } from '@/features/intelligence/services/intelligence.api'

export function CompetitorBattlecardsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [newCompName, setNewCompName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [customBattlecard, setCustomBattlecard] = useState<any>(null)

  const fetchCompetitors = async () => {
    setLoading(true)
    try {
      const data = await intelligenceApi.getCompetitors()
      setCompetitors(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompetitors()
  }, [])

  const handleGenerateBattlecard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCompName.trim()) return
    setGenerating(true)
    try {
      const data = await intelligenceApi.generateBattlecard(newCompName)
      setCustomBattlecard(data)
      fetchCompetitors()
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">swords</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              Competitive Intelligence
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">Competitor Battlecards & Objection Handlers</h1>
          <p className="text-body-sm text-on-surface-variant">
            Arm your sales reps with winning pitch hooks, competitor weaknesses, and objection handling scripts.
          </p>
        </div>

        <a href="#generator" className="btn-ai py-2.5 px-4 text-body-sm flex items-center gap-2">
          <span className="icon text-lg">auto_awesome</span>
          <span>Generate AI Battlecard</span>
        </a>
      </div>

      {/* Competitor Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
          <span className="icon text-secondary text-xl">shield</span>
          <span>Primary Market Competitors ({competitors.length})</span>
        </h2>

        {loading ? (
          <div className="glass-panel p-8 text-center text-on-surface-variant rounded-2xl">
            <span className="icon text-2xl animate-spin text-primary block mb-2">sync</span>
            Loading competitor battlecards...
          </div>
        ) : competitors.length === 0 ? (
          <div className="glass-panel p-10 text-center rounded-2xl text-on-surface-variant space-y-3">
            <span className="icon text-4xl text-primary block">swords</span>
            <div className="text-body-md font-bold text-on-surface">No Battlecards Generated Yet</div>
            <p className="text-body-sm max-w-md mx-auto">
              Enter any competitor name in the generator below (e.g. Teachmint, Entab, Fedena, SkoolBeep) to generate an AI battlecard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {competitors.map((comp) => (
              <div key={comp.id} className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="status-badge primary text-xs uppercase">{comp.category}</span>
                    <span className="text-label-md font-mono text-on-surface-variant">{comp.marketShare}</span>
                  </div>

                  <h3 className="text-headline-sm font-bold text-on-surface mb-2">{comp.name}</h3>
                  <div className="text-body-sm text-on-surface-variant mb-3 italic">Pricing: {comp.pricing}</div>

                  {/* Strengths & Weaknesses */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="text-label-sm font-semibold uppercase text-secondary mb-1">Their Weaknesses (EduVault Wins Here)</div>
                      <ul className="space-y-1 text-body-sm text-on-surface">
                        {comp.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="icon text-error text-sm">remove_circle</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Winning Pitch Box */}
                <div className="p-4 rounded-xl bg-primary-container/10 border border-primary/20 space-y-1">
                  <div className="text-label-sm font-semibold uppercase text-primary">Winning Pitch Hook</div>
                  <p className="text-body-sm text-on-surface">{comp.winningPitch}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Battlecard Generator Box */}
      <div id="generator" className="glass-panel p-6 rounded-3xl border border-tertiary/30 space-y-4">
        <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
          <span className="icon text-tertiary text-xl">auto_awesome</span>
          <span>Generate Custom Competitor Battlecard (Google Gemini 1.5 Flash)</span>
        </h2>

        <form onSubmit={handleGenerateBattlecard} className="flex gap-2">
          <input
            type="text"
            required
            value={newCompName}
            onChange={(e) => setNewCompName(e.target.value)}
            placeholder="Enter any competitor name (e.g. SkoolBeep, Next Education)..."
            className="glass-input flex-1 h-11 text-body-sm"
          />
          <button
            type="submit"
            disabled={generating}
            className="btn-ai h-11 px-6 font-semibold text-body-sm flex items-center gap-2"
          >
            <span className={`icon text-lg ${generating ? 'animate-spin' : ''}`}>psychology</span>
            <span>{generating ? 'Analyzing...' : 'Generate Battlecard'}</span>
          </button>
        </form>

        {customBattlecard && (
          <div className="p-5 rounded-2xl bg-tertiary-container/10 border border-tertiary/30 space-y-3 animate-fade-in">
            <h3 className="text-body-md font-bold text-on-surface">{customBattlecard.name} — AI Battlecard</h3>
            <div className="text-body-sm text-on-surface-variant font-medium">Category: {customBattlecard.category}</div>

            <div className="p-3 rounded-xl bg-surface-container-low text-body-sm text-on-surface border border-outline-variant/30">
              <div className="font-semibold text-primary mb-1">Winning Pitch:</div>
              {customBattlecard.winningPitch}
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low text-body-sm text-on-surface border border-outline-variant/30">
              <div className="font-semibold text-secondary mb-1">Key Objection Counter:</div>
              {customBattlecard.keyObjectionHandler}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

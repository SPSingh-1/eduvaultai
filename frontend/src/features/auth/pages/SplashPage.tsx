import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const LOADING_STEPS = [
  'Initializing EduVault Neural Engine...',
  'Connecting Autonomous AI Workforce (17 Agents)...',
  'Verifying Database & Intelligence Feeds...',
  'System Ready — Launching Command Center',
]

export function SplashPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => navigate('/login'), 600)
          return 100
        }
        return prev + 2
      })
    }, 40)

    return () => clearInterval(timer)
  }, [navigate])

  useEffect(() => {
    if (progress > 75) setCurrentStep(3)
    else if (progress > 50) setCurrentStep(2)
    else if (progress > 25) setCurrentStep(1)
  }, [progress])

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-lg w-full z-10 text-center animate-fade-in">
      {/* Outer Glow Ring */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-primary-container via-tertiary-container to-secondary-container animate-spin-slow opacity-80 blur-xl absolute"></div>
        <div className="w-24 h-24 rounded-2xl glass-panel flex items-center justify-center relative border border-primary/30 shadow-glow-blue">
          <span className="icon text-5xl text-primary animate-pulse">hub</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-display-md font-bold text-on-surface mb-2 tracking-tight">
        EduVault <span className="text-primary font-mono">AI OS</span>
      </h1>
      <p className="text-body-sm text-on-surface-variant mb-8 max-w-sm">
        Autonomous School Sales & Revenue Intelligence Workforce
      </p>

      {/* Progress Bar */}
      <div className="w-full glass-card rounded-xl p-4 border border-outline-variant/40 mb-4">
        <div className="flex justify-between items-center text-label-md mb-2">
          <span className="text-on-surface font-medium">{LOADING_STEPS[currentStep]}</span>
          <span className="text-primary font-mono font-semibold">{progress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-container via-tertiary-container to-secondary transition-all duration-150 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Footer Tag */}
      <div className="flex items-center gap-2 text-label-md text-on-surface-variant font-mono">
        <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
        <span>Version 1.0.0 — Production Build</span>
      </div>
    </div>
  )
}

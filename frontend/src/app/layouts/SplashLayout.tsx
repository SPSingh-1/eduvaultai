export function SplashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center relative overflow-hidden">
      {children}
    </div>
  )
}

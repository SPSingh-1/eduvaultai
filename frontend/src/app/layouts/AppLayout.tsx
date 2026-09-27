import { Outlet } from 'react-router-dom'
import { TopNav } from '@/components/common/TopNav'
import { Sidebar } from '@/components/common/Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-container/40">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto page-container pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

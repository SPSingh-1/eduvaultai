import { useState, useEffect } from 'react'
import { salesApi } from '@/features/sales/services/sales.api'

export function TaskDeskPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const data = await salesApi.getTasks()
      setTasks(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleToggleTask = async (id: string) => {
    try {
      await salesApi.toggleTask(id)
      fetchTasks()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">check_circle</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              Workforce Execution
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">AI Sales Task Manager</h1>
          <p className="text-body-sm text-on-surface-variant">
            Action items assigned to sales representatives and autonomous AI agents.
          </p>
        </div>
      </div>

      {/* Task List Container */}
      <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-3">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">
            <span className="icon text-2xl animate-spin text-primary block mb-2">sync</span>
            Loading sales task manager...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">No pending tasks.</div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                task.completed
                  ? 'glass-card border-outline-variant/20 opacity-60'
                  : 'glass-card border-outline-variant/40 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  className="rounded border-outline-variant bg-surface-container-high text-primary w-5 h-5 cursor-pointer"
                />
                <div>
                  <div className={`text-body-md font-semibold ${task.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                    {task.title}
                  </div>
                  <div className="text-label-md text-on-surface-variant flex items-center gap-2 mt-0.5">
                    <span className="icon text-xs">schedule</span>
                    <span>{task.dueDate}</span>
                    <span>•</span>
                    <span className="capitalize">{task.type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <span className={`status-badge ${task.priority === 'high' ? 'error' : 'primary'}`}>
                {task.priority.toUpperCase()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

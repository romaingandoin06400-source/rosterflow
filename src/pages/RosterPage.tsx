import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Columns, List, Plus, User } from 'lucide-react'
import { useRosterStore, ViewMode } from '@/store/rosterStore'
import { useAuthStore } from '@/store/authStore'
import ContactGrid from '@/components/ContactGrid'
import KanbanBoard from '@/components/KanbanBoard'
import ContactList from '@/components/ContactList'
import AddContactPanel from '@/components/AddContactPanel'

const VIEW_BUTTONS: { mode: ViewMode; Icon: typeof LayoutGrid; label: string }[] = [
  { mode: 'grid', Icon: LayoutGrid, label: 'Grid' },
  { mode: 'kanban', Icon: Columns, label: 'Kanban' },
  { mode: 'list', Icon: List, label: 'List' },
]

export default function RosterPage() {
  const { activeView, setView, openAddPanel, fetchContacts, loading, contacts } = useRosterStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-bg/90 backdrop-blur border-b border-bg-border">
        <button
          onClick={() => navigate('/account')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center">
            <User size={13} className="text-brand" />
          </div>
          <span className="text-sm font-semibold hidden sm:block">RosterFlow</span>
        </button>

        {/* View toggle */}
        <div className="flex items-center gap-0.5 bg-bg-elevated rounded-xl p-1 border border-bg-border">
          {VIEW_BUTTONS.map(({ mode, Icon, label }) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              aria-label={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeView === mode
                  ? 'bg-bg-card text-text-primary shadow-card'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Add contact */}
        <button
          onClick={openAddPanel}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-xl shadow-glow transition-colors"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </header>

      {/* Content */}
      <main className="p-4">
        {loading && contacts.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
          </div>
        ) : activeView === 'grid' ? (
          <ContactGrid />
        ) : activeView === 'kanban' ? (
          <KanbanBoard />
        ) : (
          <ContactList />
        )}
      </main>

      <AddContactPanel />
    </div>
  )
}

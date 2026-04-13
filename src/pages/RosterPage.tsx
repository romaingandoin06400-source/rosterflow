import { useEffect } from 'react'
import { LayoutGrid, Columns, List, Plus } from 'lucide-react'
import { useRosterStore, ViewMode } from '@/store/rosterStore'
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

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#0f0f0f]/90 backdrop-blur border-b border-white/5">
        <span className="text-lg font-semibold tracking-tight">RosterFlow</span>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {VIEW_BUTTONS.map(({ mode, Icon, label }) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              aria-label={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeView === mode
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Add contact */}
        <button
          onClick={openAddPanel}
          className="flex items-center gap-2 px-3 py-1.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </header>

      {/* Content */}
      <main className="p-4">
        {loading && contacts.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-white/30 text-sm">Loading...</div>
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

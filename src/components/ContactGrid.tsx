import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useRosterStore } from '@/store/rosterStore'
import ContactCard from './ContactCard'

export default function ContactGrid() {
  const { contacts, openAddPanel } = useRosterStore()
  const navigate = useNavigate()
  const visible = contacts.filter((c) => c.stage !== 'archived')

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-text-muted text-sm">No contacts yet.</p>
        <button
          onClick={openAddPanel}
          className="flex items-center gap-2 px-4 py-2 bg-bg-elevated border border-bg-border rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <Plus size={14} />
          Add your first contact
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {visible.map((c) => (
        <ContactCard key={c.id} contact={c} />
      ))}
    </div>
  )
}

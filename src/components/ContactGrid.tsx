import { useRosterStore } from '@/store/rosterStore'
import ContactCard from './ContactCard'

export default function ContactGrid() {
  const contacts = useRosterStore((s) => s.contacts.filter((c) => c.stage !== 'archived'))

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/30 text-sm gap-2">
        <span>No contacts yet.</span>
        <span>Hit Add to get started.</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  )
}

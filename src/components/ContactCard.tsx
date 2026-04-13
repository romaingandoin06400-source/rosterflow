import { useNavigate } from 'react-router-dom'
import { Contact, STAGE_LABELS } from '@/lib/types'

const STAGE_COLORS: Record<string, string> = {
  matched: 'bg-accent-blue/15 text-accent-blue',
  talking: 'bg-accent-amber/15 text-accent-amber',
  irl: 'bg-orange-400/15 text-orange-400',
  dating: 'bg-accent-green/15 text-accent-green',
  archived: 'bg-white/5 text-text-muted',
}

export default function ContactCard({ contact }: { contact: Contact }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/contacts/${contact.id}`)}
      className="group flex flex-col items-center gap-2.5 p-3 rounded-2xl bg-bg-card border border-bg-border hover:border-white/10 hover:bg-bg-elevated transition-all shadow-card text-center w-full"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden bg-bg-elevated border border-bg-border flex-shrink-0">
        {contact.photo_url ? (
          <img src={contact.photo_url} alt={contact.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-xl font-semibold">
            {contact.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-text-primary truncate w-full">{contact.name}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[contact.stage]}`}>
        {STAGE_LABELS[contact.stage]}
      </span>
    </button>
  )
}

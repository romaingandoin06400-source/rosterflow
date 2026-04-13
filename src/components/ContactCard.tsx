import { useNavigate } from 'react-router-dom'
import { Contact } from '@/lib/types'
import { STAGE_LABELS } from '@/lib/types'

const STAGE_COLORS: Record<string, string> = {
  matched: 'bg-blue-500/20 text-blue-300',
  talking: 'bg-yellow-500/20 text-yellow-300',
  irl: 'bg-orange-500/20 text-orange-300',
  dating: 'bg-green-500/20 text-green-300',
  archived: 'bg-white/10 text-white/30',
}

interface Props {
  contact: Contact
}

export default function ContactCard({ contact }: Props) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/contacts/${contact.id}`)}
      className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center w-full"
    >
      {/* Photo */}
      <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
        {contact.photo_url ? (
          <img
            src={contact.photo_url}
            alt={contact.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-xl font-semibold">
            {contact.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name */}
      <span className="text-sm font-medium text-white truncate w-full">{contact.name}</span>

      {/* Stage badge */}
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[contact.stage]}`}>
        {STAGE_LABELS[contact.stage]}
      </span>
    </button>
  )
}

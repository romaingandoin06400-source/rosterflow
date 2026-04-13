import { useNavigate } from 'react-router-dom'
import { useRosterStore } from '@/store/rosterStore'
import { STAGE_LABELS } from '@/lib/types'
import { format } from 'date-fns'

const STAGE_COLORS: Record<string, string> = {
  matched: 'text-blue-300',
  talking: 'text-yellow-300',
  irl: 'text-orange-300',
  dating: 'text-green-300',
  archived: 'text-white/30',
}

export default function ContactList() {
  const contacts = useRosterStore((s) => s.contacts)
  const navigate = useNavigate()

  if (contacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30 text-sm">
        No contacts yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-white/40 text-left">
            <th className="pb-2 pl-2 font-medium">Name</th>
            <th className="pb-2 font-medium">Stage</th>
            <th className="pb-2 font-medium hidden sm:table-cell">Source</th>
            <th className="pb-2 font-medium hidden md:table-cell">Added</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr
              key={c.id}
              onClick={() => navigate(`/contacts/${c.id}`)}
              className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <td className="py-3 pl-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                    {c.photo_url ? (
                      <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-semibold">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-white">{c.name}</span>
                </div>
              </td>
              <td className={`py-3 font-medium ${STAGE_COLORS[c.stage]}`}>
                {STAGE_LABELS[c.stage]}
              </td>
              <td className="py-3 text-white/50 hidden sm:table-cell">{c.source_app || '—'}</td>
              <td className="py-3 text-white/40 hidden md:table-cell">
                {format(new Date(c.created_at), 'MMM d, yyyy')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

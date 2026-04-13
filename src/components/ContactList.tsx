import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useRosterStore } from '@/store/rosterStore'
import { STAGE_LABELS } from '@/lib/types'

const STAGE_COLORS: Record<string, string> = {
  matched: 'text-accent-blue',
  talking: 'text-accent-amber',
  irl: 'text-orange-400',
  dating: 'text-accent-green',
  archived: 'text-text-muted',
}

export default function ContactList() {
  const contacts = useRosterStore((s) => s.contacts)
  const navigate = useNavigate()

  if (contacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted text-sm">
        No contacts yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-bg-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-bg-border bg-bg-card">
            <th className="py-3 pl-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
            <th className="py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Stage</th>
            <th className="py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Source</th>
            <th className="py-3 pr-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Added</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c, i) => (
            <tr
              key={c.id}
              onClick={() => navigate(`/contacts/${c.id}`)}
              className={`cursor-pointer hover:bg-bg-elevated transition-colors ${
                i < contacts.length - 1 ? 'border-b border-bg-border' : ''
              }`}
            >
              <td className="py-3 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-bg-elevated border border-bg-border flex-shrink-0">
                    {c.photo_url ? (
                      <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-semibold">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-text-primary">{c.name}</span>
                </div>
              </td>
              <td className={`py-3 font-medium ${STAGE_COLORS[c.stage]}`}>{STAGE_LABELS[c.stage]}</td>
              <td className="py-3 text-text-secondary hidden sm:table-cell">{c.source_app || '—'}</td>
              <td className="py-3 pr-4 text-text-muted hidden md:table-cell">
                {format(new Date(c.created_at), 'MMM d, yyyy')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

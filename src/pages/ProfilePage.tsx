import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Sparkles, Trash2, Archive } from 'lucide-react'
import { useRosterStore } from '@/store/rosterStore'
import { Stage, STAGES, STAGE_LABELS } from '@/lib/types'
import { supabase } from '@/lib/supabase'

const STAGE_COLORS: Record<Stage, string> = {
  matched: 'border-accent-blue text-accent-blue bg-accent-blue/10',
  talking: 'border-accent-amber text-accent-amber bg-accent-amber/10',
  irl: 'border-orange-400 text-orange-400 bg-orange-400/10',
  dating: 'border-accent-green text-accent-green bg-accent-green/10',
  archived: 'border-bg-border text-text-muted bg-white/5',
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { contacts, updateContact, deleteContact } = useRosterStore()
  const contact = contacts.find((c) => c.id === id)

  const [notes, setNotes] = useState(contact?.notes ?? '')
  const [summary, setSummary] = useState<string | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (contact) setNotes(contact.notes ?? '')
  }, [contact?.id])

  if (!contact) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3 text-text-muted">
        <p>Contact not found.</p>
        <button onClick={() => navigate('/')} className="text-sm text-text-secondary underline">Go back</button>
      </div>
    )
  }

  const handleNotesBlur = () => {
    if (notes !== contact.notes) updateContact(contact.id, { notes })
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    deleteContact(contact.id)
    navigate('/')
  }

  const handleGenerateSummary = async () => {
    setLoadingSummary(true)
    setSummaryError(null)
    setSummary(null)
    const { data, error } = await supabase.functions.invoke('grok-supervisor', {
      body: {
        action: 'summarize_contact',
        contact: { name: contact.name, stage: contact.stage, source_app: contact.source_app, notes: contact.notes },
      },
    })
    if (error || !data?.summary) {
      setSummaryError('Could not generate summary. Make sure the Grok Edge Function is deployed.')
    } else {
      setSummary(data.summary)
    }
    setLoadingSummary(false)
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-bg/90 backdrop-blur border-b border-bg-border">
        <button onClick={() => navigate('/')} className="text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-text-primary">{contact.name}</span>
      </header>

      <div className="max-w-lg mx-auto p-5 flex flex-col gap-6 pb-16">
        {/* Hero */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-bg-elevated border border-bg-border">
            {contact.photo_url ? (
              <img src={contact.photo_url} alt={contact.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-text-muted">
                {contact.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="text-xl font-semibold text-text-primary">{contact.name}</h1>
          {contact.source_app && (
            <span className="text-sm text-text-muted">via {contact.source_app}</span>
          )}
        </div>

        {/* Stage */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Stage</label>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => updateContact(contact.id, { stage: s })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  contact.stage === s ? STAGE_COLORS[s] : 'border-bg-border text-text-muted hover:border-white/20'
                }`}
              >
                {STAGE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add notes about this person..."
            rows={4}
            className="bg-bg-card border border-bg-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white/20 transition-colors resize-none"
          />
        </div>

        {/* AI Summary */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              AI Relationship Summary
            </label>
            <button
              onClick={handleGenerateSummary}
              disabled={loadingSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand/10 hover:bg-brand/20 border border-brand/20 text-brand rounded-lg transition-colors disabled:opacity-50"
            >
              <Sparkles size={11} />
              {loadingSummary ? 'Generating...' : 'Generate'}
            </button>
          </div>
          <div className="min-h-[80px] bg-bg-card border border-bg-border rounded-xl px-4 py-3">
            {loadingSummary ? (
              <p className="text-sm text-text-muted animate-pulse">Asking Grok...</p>
            ) : summaryError ? (
              <p className="text-sm text-red-400/80">{summaryError}</p>
            ) : summary ? (
              <p className="text-sm text-text-secondary leading-relaxed">{summary}</p>
            ) : (
              <p className="text-sm text-text-muted">Hit Generate to get an AI summary of this relationship.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-bg-border pt-4 flex flex-col gap-2">
          <button
            onClick={() => { updateContact(contact.id, { stage: 'archived' }); navigate('/') }}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-text-muted hover:text-text-secondary border border-bg-border rounded-xl transition-colors"
          >
            <Archive size={14} />
            Archive Contact
          </button>
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-400/70 hover:text-red-400 border border-red-400/10 hover:border-red-400/30 rounded-xl transition-colors"
          >
            <Trash2 size={14} />
            {confirmDelete ? 'Tap again to confirm delete' : 'Delete Contact'}
          </button>
        </div>
      </div>
    </div>
  )
}

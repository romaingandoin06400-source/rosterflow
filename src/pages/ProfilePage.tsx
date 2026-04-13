import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Sparkles, Trash2 } from 'lucide-react'
import { useRosterStore } from '@/store/rosterStore'
import { Stage, STAGES, STAGE_LABELS } from '@/lib/types'
import { supabase } from '@/lib/supabase'

const STAGE_COLORS: Record<Stage, string> = {
  matched: 'text-blue-300',
  talking: 'text-yellow-300',
  irl: 'text-orange-300',
  dating: 'text-green-300',
  archived: 'text-white/30',
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
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white/30">
        Contact not found.{' '}
        <button onClick={() => navigate('/')} className="ml-2 underline text-white/50">
          Go back
        </button>
      </div>
    )
  }

  const handleStageChange = (stage: Stage) => {
    updateContact(contact.id, { stage })
  }

  const handleNotesBlur = () => {
    if (notes !== contact.notes) {
      updateContact(contact.id, { notes })
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
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
        contact: {
          name: contact.name,
          stage: contact.stage,
          source_app: contact.source_app,
          notes: contact.notes,
        },
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
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-[#0f0f0f]/90 backdrop-blur border-b border-white/5">
        <button onClick={() => navigate('/')} className="text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold">{contact.name}</span>
      </header>

      <div className="max-w-lg mx-auto p-5 flex flex-col gap-6">
        {/* Hero */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10">
            {contact.photo_url ? (
              <img src={contact.photo_url} alt={contact.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-white/30">
                {contact.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="text-xl font-semibold">{contact.name}</h1>
          {contact.source_app && (
            <span className="text-sm text-white/40">via {contact.source_app}</span>
          )}
        </div>

        {/* Stage */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-white/40 font-medium uppercase tracking-wider">Stage</label>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => handleStageChange(s)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  contact.stage === s
                    ? `border-current ${STAGE_COLORS[s]} bg-white/5`
                    : 'border-white/10 text-white/30 hover:border-white/20'
                }`}
              >
                {STAGE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-white/40 font-medium uppercase tracking-wider">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add notes about this person..."
            rows={4}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none"
          />
        </div>

        {/* AI Summary */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/40 font-medium uppercase tracking-wider">
              Relationship Summary
            </label>
            <button
              onClick={handleGenerateSummary}
              disabled={loadingSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-40"
            >
              <Sparkles size={12} />
              {loadingSummary ? 'Generating...' : 'Generate'}
            </button>
          </div>

          <div className="min-h-[80px] bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
            {loadingSummary ? (
              <p className="text-sm text-white/30 animate-pulse">Asking Grok...</p>
            ) : summaryError ? (
              <p className="text-sm text-red-400/70">{summaryError}</p>
            ) : summary ? (
              <p className="text-sm text-white/80 leading-relaxed">{summary}</p>
            ) : (
              <p className="text-sm text-white/20">Hit Generate to get an AI summary of this relationship.</p>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
          <button
            onClick={() => { updateContact(contact.id, { stage: 'archived' }); navigate('/') }}
            className="w-full py-2.5 text-sm text-white/40 hover:text-white/60 border border-white/10 rounded-lg transition-colors"
          >
            Archive Contact
          </button>
          <button
            onClick={handleDelete}
            className="w-full py-2.5 text-sm flex items-center justify-center gap-2 text-red-400/70 hover:text-red-400 border border-red-400/10 hover:border-red-400/30 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
            {confirmDelete ? 'Tap again to confirm delete' : 'Delete Contact'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import { X, Upload } from 'lucide-react'
import { useRosterStore } from '@/store/rosterStore'
import { Stage, STAGES, STAGE_LABELS } from '@/lib/types'
import { supabase } from '@/lib/supabase'

const SOURCE_APPS = ['Tinder', 'Bumble', 'Hinge', 'Happn', 'OkCupid', 'IRL', 'Other']

export default function AddContactPanel() {
  const { isAddPanelOpen, closeAddPanel, addContact } = useRosterStore()
  const [name, setName] = useState('')
  const [stage, setStage] = useState<Stage>('matched')
  const [sourceApp, setSourceApp] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => { setName(''); setStage('matched'); setSourceApp(''); setPhotoUrl('') }

  const handleClose = () => { reset(); closeAddPanel() }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `contacts/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('photos').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('photos').getPublicUrl(path)
      setPhotoUrl(data.publicUrl)
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await addContact({ name: name.trim(), photo_url: photoUrl || null, stage, source_app: sourceApp || null, notes: null })
    setSaving(false)
    handleClose()
  }

  if (!isAddPanelOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-20 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-bg-elevated border-l border-bg-border z-30 flex flex-col shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
          <h2 className="text-base font-semibold text-text-primary">Add Contact</h2>
          <button onClick={handleClose} className="text-text-muted hover:text-text-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 flex-1 overflow-y-auto">
          {/* Photo */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-20 h-20 rounded-full overflow-hidden bg-bg-card border border-bg-border flex items-center justify-center cursor-pointer hover:border-white/20 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="preview" className="w-full h-full object-cover" />
              ) : uploading ? (
                <div className="w-5 h-5 rounded-full border-2 border-brand border-t-transparent animate-spin" />
              ) : (
                <Upload size={18} className="text-text-muted" />
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <span className="text-xs text-text-muted">Tap to upload photo</span>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              required
              className="bg-bg border border-bg-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {/* Stage */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as Stage)}
              className="bg-bg border border-bg-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-white/20 transition-colors"
            >
              {STAGES.filter((s) => s !== 'archived').map((s) => (
                <option key={s} value={s}>{STAGE_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-secondary">Source App</label>
            <div className="flex flex-wrap gap-2">
              {SOURCE_APPS.map((app) => (
                <button
                  key={app}
                  type="button"
                  onClick={() => setSourceApp(sourceApp === app ? '' : app)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    sourceApp === app
                      ? 'bg-brand text-white border-brand shadow-glow'
                      : 'bg-transparent text-text-secondary border-bg-border hover:border-white/20'
                  }`}
                >
                  {app}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="mt-auto w-full py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-xl shadow-glow disabled:opacity-40 transition-colors"
          >
            {saving ? 'Adding...' : 'Add Contact'}
          </button>
        </form>
      </div>
    </>
  )
}

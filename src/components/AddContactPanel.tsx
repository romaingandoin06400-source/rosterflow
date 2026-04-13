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

  const reset = () => {
    setName('')
    setStage('matched')
    setSourceApp('')
    setPhotoUrl('')
  }

  const handleClose = () => {
    reset()
    closeAddPanel()
  }

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
    await addContact({
      name: name.trim(),
      photo_url: photoUrl || null,
      stage,
      source_app: sourceApp || null,
      notes: null,
    })
    setSaving(false)
    handleClose()
  }

  if (!isAddPanelOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#161616] border-l border-white/10 z-30 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-base font-semibold">Add Contact</h2>
          <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 flex-1 overflow-y-auto">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-20 h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/15 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="preview" className="w-full h-full object-cover" />
              ) : uploading ? (
                <span className="text-white/40 text-xs">...</span>
              ) : (
                <Upload size={20} className="text-white/30" />
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <span className="text-xs text-white/30">Tap to upload photo</span>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 font-medium">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              required
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Stage */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 font-medium">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as Stage)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
            >
              {STAGES.filter((s) => s !== 'archived').map((s) => (
                <option key={s} value={s} className="bg-[#161616]">
                  {STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Source app */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 font-medium">Source App</label>
            <div className="flex flex-wrap gap-2">
              {SOURCE_APPS.map((app) => (
                <button
                  key={app}
                  type="button"
                  onClick={() => setSourceApp(sourceApp === app ? '' : app)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    sourceApp === app
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'
                  }`}
                >
                  {app}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="mt-auto w-full py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 disabled:opacity-40 transition-colors"
          >
            {saving ? 'Adding...' : 'Add Contact'}
          </button>
        </form>
      </div>
    </>
  )
}

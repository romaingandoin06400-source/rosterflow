import { create } from 'zustand'
import { Contact, ContactInsert, Stage } from '@/lib/types'
import { supabase } from '@/lib/supabase'

export type ViewMode = 'grid' | 'kanban' | 'list'

interface RosterState {
  contacts: Contact[]
  activeView: ViewMode
  isAddPanelOpen: boolean
  loading: boolean

  // actions
  fetchContacts: () => Promise<void>
  setView: (view: ViewMode) => void
  openAddPanel: () => void
  closeAddPanel: () => void
  addContact: (data: ContactInsert) => Promise<void>
  updateContact: (id: string, patch: Partial<ContactInsert>) => Promise<void>
  deleteContact: (id: string) => Promise<void>
}

export const useRosterStore = create<RosterState>((set, get) => ({
  contacts: [],
  activeView: 'grid',
  isAddPanelOpen: false,
  loading: false,

  fetchContacts: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) set({ contacts: data as Contact[] })
    set({ loading: false })
  },

  setView: (view) => set({ activeView: view }),
  openAddPanel: () => set({ isAddPanelOpen: true }),
  closeAddPanel: () => set({ isAddPanelOpen: false }),

  addContact: async (data) => {
    const { data: inserted, error } = await supabase
      .from('contacts')
      .insert(data)
      .select()
      .single()
    if (!error && inserted) {
      set((s) => ({ contacts: [inserted as Contact, ...s.contacts] }))
    }
  },

  updateContact: async (id, patch) => {
    // optimistic
    set((s) => ({
      contacts: s.contacts.map((c) =>
        c.id === id ? { ...c, ...patch, updated_at: new Date().toISOString() } : c
      ),
    }))
    await supabase.from('contacts').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
  },

  deleteContact: async (id) => {
    // optimistic
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) }))
    await supabase.from('contacts').delete().eq('id', id)
  },

  moveToStage: async (id: string, stage: Stage) => {
    get().updateContact(id, { stage })
  },
}))

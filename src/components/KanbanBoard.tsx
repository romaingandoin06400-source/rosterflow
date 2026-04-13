import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useRosterStore } from '@/store/rosterStore'
import { Contact, Stage, STAGES, STAGE_LABELS } from '@/lib/types'

function DraggableCard({ contact }: { contact: Contact }) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: contact.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      <div
        className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation()
          navigate(`/contacts/${contact.id}`)
        }}
      >
        {contact.photo_url ? (
          <img src={contact.photo_url} alt={contact.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-semibold">
            {contact.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <span
        className="text-sm font-medium text-white truncate flex-1 cursor-pointer"
        onClick={() => navigate(`/contacts/${contact.id}`)}
      >
        {contact.name}
      </span>
    </div>
  )
}

function KanbanColumn({ stage, contacts }: { stage: Stage; contacts: Contact[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div className="flex flex-col gap-2 min-w-[200px] w-52 flex-shrink-0">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          {STAGE_LABELS[stage]}
        </span>
        <span className="text-xs text-white/30">{contacts.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 min-h-[120px] p-2 rounded-xl border transition-colors ${
          isOver ? 'bg-white/10 border-white/20' : 'bg-white/[0.03] border-white/5'
        }`}
      >
        {contacts.map((c) => (
          <DraggableCard key={c.id} contact={c} />
        ))}
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const { contacts, updateContact } = useRosterStore()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const newStage = over.id as Stage
    if (STAGES.includes(newStage)) {
      updateContact(active.id as string, { stage: newStage })
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            contacts={contacts.filter((c) => c.stage === stage)}
          />
        ))}
      </div>
    </DndContext>
  )
}

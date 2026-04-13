export type Stage = 'matched' | 'talking' | 'irl' | 'dating' | 'archived'

export interface Contact {
  id: string
  user_id: string
  name: string
  photo_url: string | null
  stage: Stage
  source_app: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ContactInsert = Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export const STAGES: Stage[] = ['matched', 'talking', 'irl', 'dating', 'archived']

export const STAGE_LABELS: Record<Stage, string> = {
  matched: 'Matched',
  talking: 'Talking',
  irl: 'IRL',
  dating: 'Dating',
  archived: 'Archived',
}

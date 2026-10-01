export type ResponseType = 'answer' | 'pick_apps' | 'not_found' | 'error'

export interface Source {
  num: number
  app: string
  doc: string
  section: string
  text: string
  url: string
}

export interface AskRequest {
  message: string
  prev_question: string
  prev_type: string
  focus_app: string
}

export interface AskResponse {
  type: ResponseType
  focus_app: string
  question: string
  rewritten: boolean
  answer: string
  sources: Source[]
  followups: string[]
}

/** Where a focus choice came from (a logo in the hero), so the scope pill can grow out of it. */
export type FocusOrigin = { id: string; rect: DOMRect; at: number }

/** One question and its answer card. Kept in memory only. */
export interface Entry {
  id: string
  message: string
  request: AskRequest
  status: 'loading' | 'done'
  data?: AskResponse
}

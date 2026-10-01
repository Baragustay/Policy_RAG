import { Client } from '@gradio/client'
import type { AskRequest, AskResponse, ResponseType } from './types'

const SPACE = import.meta.env.VITE_HF_SPACE

// One client for the whole session. Connecting early wakes the sleeping Space.
let clientPromise: Promise<Client> | null = null
let connected = false

export const isConnected = () => connected

export function connect(): Promise<Client> {
  if (!SPACE) return Promise.reject(new Error('VITE_HF_SPACE is not set'))
  if (!clientPromise) {
    clientPromise = Client.connect(SPACE).then(
      (client) => {
        connected = true
        return client
      },
      (err) => {
        clientPromise = null // let the next call try again
        throw err
      },
    )
  }
  return clientPromise
}

const TYPES: ResponseType[] = ['answer', 'pick_apps', 'not_found', 'error']

export async function ask(req: AskRequest): Promise<AskResponse> {
  const client = await connect()
  const res = await client.predict('/ask', { ...req })
  const raw = ((res.data as unknown[])[0] ?? {}) as Partial<AskResponse>
  // Copy only the fields the UI uses; `debug` is dropped on purpose.
  return {
    type: TYPES.includes(raw.type as ResponseType) ? (raw.type as ResponseType) : 'error',
    focus_app: raw.focus_app ?? '',
    question: raw.question ?? req.message,
    rewritten: Boolean(raw.rewritten),
    answer: raw.answer ?? '',
    sources: Array.isArray(raw.sources) ? raw.sources : [],
    followups: Array.isArray(raw.followups) ? raw.followups.slice(0, 3) : [],
  }
}

export async function listApps(): Promise<{ apps: string[]; names: Record<string, string> }> {
  const client = await connect()
  const res = await client.predict('/list_apps', {})
  const data = (res.data as unknown[])[0] as { apps?: string[]; names?: Record<string, string> }
  return { apps: data?.apps ?? [], names: data?.names ?? {} }
}

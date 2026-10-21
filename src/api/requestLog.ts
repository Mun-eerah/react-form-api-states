export type RequestOutcome = number | 'network-error' | 'aborted'

export interface RequestLogEntry {
  id: number
  method: string
  path: string
  outcome: RequestOutcome
  durationMs: number
}

const MAX_ENTRIES = 6

// Kept outside React so the log keeps recording while the demo controls are closed.
let recent: RequestLogEntry[] = []
const listeners = new Set<() => void>()
let nextId = 1

export function logRequest(entry: Omit<RequestLogEntry, 'id'>) {
  recent = [{ ...entry, id: nextId++ }, ...recent].slice(0, MAX_ENTRIES)
  listeners.forEach((listener) => listener())
}

export function subscribeToRequests(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getRecentRequests = () => recent

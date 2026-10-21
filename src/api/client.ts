import { mockServer, type MockRequest, type RequestOptions } from './mockServer'
import { logRequest } from './requestLog'

/** The server answered, but with a 4xx/5xx status. */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/** The request never got a response (offline, DNS, CORS, timeout...). */
export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message)
    this.name = 'NetworkError'
  }
}

export const isAbortError = (err: unknown) => err instanceof DOMException && err.name === 'AbortError'

interface ErrorBody {
  message?: string
  errors?: Record<string, string>
}

/**
 * Same job as a typical `fetch` wrapper: send the request, turn non-2xx
 * responses into ApiError and network failures into NetworkError, so
 * components only deal with a few known error types.
 */
export async function request<T>(req: MockRequest, options: RequestOptions): Promise<T> {
  const started = performance.now()
  const log = (outcome: number | 'network-error' | 'aborted') =>
    logRequest({ method: req.method, path: req.path, outcome, durationMs: Math.round(performance.now() - started) })

  let response
  try {
    response = await mockServer(req, options)
  } catch (err) {
    if (isAbortError(err)) {
      log('aborted')
      throw err
    }
    log('network-error')
    throw new NetworkError()
  }

  log(response.status)

  if (response.status >= 400) {
    const body = (response.body ?? {}) as ErrorBody
    throw new ApiError(response.status, body.message ?? `Request failed with status ${response.status}`, body.errors)
  }

  return response.body as T
}

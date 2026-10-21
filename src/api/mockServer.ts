import { burgers } from '../data/burgers'

/**
 * A tiny in-browser "backend". It waits, then answers like a real HTTP API
 * would: a status code plus a JSON body, or a thrown TypeError when the
 * network fails (which is exactly what `fetch` does).
 */
export interface MockRequest {
  method: 'GET' | 'POST'
  path: string
  body?: unknown
  scenario: string
}

export interface MockResponse {
  status: number
  body: unknown
}

export interface RequestOptions {
  latencyMs: number
  signal?: AbortSignal
}

const abortError = () => new DOMException('The request was aborted.', 'AbortError')

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(abortError())
      },
      { once: true },
    )
  })
}

const orderId = () => `BQ-${Math.floor(1000 + Math.random() * 9000)}`

export async function mockServer(req: MockRequest, { latencyMs, signal }: RequestOptions): Promise<MockResponse> {
  const route = `${req.method} ${req.path}`

  if (route === 'POST /api/orders') {
    await wait(latencyMs, signal)
    switch (req.scenario) {
      case 'validation-error':
        return {
          status: 400,
          body: {
            message: 'Some details need your attention.',
            errors: {
              email: 'This email is already linked to another account.',
              address: "Sorry, we don't deliver to this area yet.",
            },
          },
        }
      case 'server-error':
        return { status: 500, body: { message: 'Internal Server Error' } }
      case 'network-error':
        throw new TypeError('Failed to fetch')
      default:
        return { status: 201, body: { id: orderId(), etaMinutes: 25 } }
    }
  }

  if (route === 'GET /api/menu') {
    await wait(req.scenario === 'slow' ? latencyMs * 3 : latencyMs, signal)
    switch (req.scenario) {
      case 'empty':
        return { status: 200, body: [] }
      case 'error':
        return { status: 503, body: { message: 'Menu service unavailable' } }
      default:
        return { status: 200, body: burgers }
    }
  }

  await wait(latencyMs, signal)
  return { status: 404, body: { message: `No route for ${route}` } }
}

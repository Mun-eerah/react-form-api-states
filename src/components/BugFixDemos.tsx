import { useRef, useState, type ReactNode } from 'react'
import { Bug, CheckCircle2 } from 'lucide-react'
import { placeOrder } from '../api/api'
import { emptyCheckout } from '../lib/checkout'
import { cn, primaryButton } from '../lib/styles'
import { Alert, Spinner } from './ui'

type Version = 'buggy' | 'fixed'

interface CodeLine {
  text: string
  mark?: 'bug' | 'fix'
}

const demoValues = { ...emptyCheckout, fullName: 'Demo user' }

export function BugFixDemos({ latencyMs = 900 }: { latencyMs?: number }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <StuckSpinnerDemo latencyMs={latencyMs} />
      <DoubleSubmitDemo latencyMs={latencyMs} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Bug 1: the button stays on "loading" forever after a failed request */
/* ------------------------------------------------------------------ */

const stuckBuggyCode: CodeLine[] = [
  { text: 'setLoading(true)' },
  { text: 'try {' },
  { text: '  await placeOrder(values)' },
  { text: '  setLoading(false)', mark: 'bug' },
  { text: '} catch (err) {' },
  { text: '  setError(getMessage(err))' },
  { text: '}' },
]

const stuckFixedCode: CodeLine[] = [
  { text: 'setLoading(true)' },
  { text: 'try {' },
  { text: '  await placeOrder(values)' },
  { text: '} catch (err) {' },
  { text: '  setError(getMessage(err))' },
  { text: '} finally {', mark: 'fix' },
  { text: '  setLoading(false)', mark: 'fix' },
  { text: '}' },
]

function StuckSpinnerDemo({ latencyMs }: { latencyMs: number }) {
  const [version, setVersion] = useState<Version>('buggy')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setLoading(false)
    setError(null)
  }

  const handleClick = async () => {
    setLoading(true)
    setError(null)

    if (version === 'buggy') {
      try {
        await placeOrder(demoValues, 'server-error', { latencyMs })
        setLoading(false)
      } catch {
        setError('Server error (500). Please try again.')
        // BUG: loading is only reset on success, so the button stays stuck.
      }
      return
    }

    try {
      await placeOrder(demoValues, 'server-error', { latencyMs })
    } catch {
      setError('Server error (500). Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BugCard
      title="Button stuck on “loading” after an error"
      symptom="After a failed request, the button spins forever and the user can't retry without refreshing."
      cause="Loading was only reset on the success path."
      fix="Reset it in finally, which runs whether the request succeeds or fails."
      version={version}
      onVersionChange={(next) => {
        setVersion(next)
        reset()
      }}
      code={version === 'buggy' ? stuckBuggyCode : stuckFixedCode}
      onReset={reset}
    >
      <p className="text-xs text-white/50">This demo's API always returns 500.</p>
      <button type="button" onClick={handleClick} disabled={loading} className={cn(primaryButton, 'w-full')}>
        {loading ? (
          <>
            <Spinner /> Placing order…
          </>
        ) : error ? (
          'Try again'
        ) : (
          'Place order'
        )}
      </button>
      {error && <Alert tone="error" title={error} />}
      {error && loading && (
        <p className="text-sm text-red-300">
          Stuck: the error is showing, but the button is still disabled.
        </p>
      )}
    </BugCard>
  )
}

/* --------------------------------------------------------- */
/* Bug 2: double-clicking submit creates duplicate orders     */
/* --------------------------------------------------------- */

const doubleBuggyCode: CodeLine[] = [
  { text: 'async function handleSubmit() {' },
  { text: '  // nothing stops a second click', mark: 'bug' },
  { text: '  const order = await placeOrder(values)' },
  { text: '  addOrder(order)' },
  { text: '}' },
  { text: '' },
  { text: '<button onClick={handleSubmit}>', mark: 'bug' },
]

const doubleFixedCode: CodeLine[] = [
  { text: 'async function handleSubmit() {' },
  { text: '  if (inFlight.current) return', mark: 'fix' },
  { text: '  inFlight.current = true', mark: 'fix' },
  { text: '  setSubmitting(true)' },
  { text: '  try {' },
  { text: '    addOrder(await placeOrder(values))' },
  { text: '  } finally {' },
  { text: '    inFlight.current = false' },
  { text: '    setSubmitting(false)' },
  { text: '  }' },
  { text: '}' },
  { text: '' },
  { text: '<button disabled={submitting} onClick={handleSubmit}>', mark: 'fix' },
]

function DoubleSubmitDemo({ latencyMs }: { latencyMs: number }) {
  const [version, setVersion] = useState<Version>('buggy')
  const [orders, setOrders] = useState<string[]>([])
  const [pending, setPending] = useState(0)
  const inFlight = useRef(false)

  const reset = () => {
    setOrders([])
  }

  const handleClick = async () => {
    if (version === 'fixed') {
      if (inFlight.current) return
      inFlight.current = true
    }

    setPending((count) => count + 1)
    try {
      const order = await placeOrder(demoValues, 'success', { latencyMs })
      setOrders((current) => [...current, order.id])
    } finally {
      setPending((count) => count - 1)
      if (version === 'fixed') inFlight.current = false
    }
  }

  const submitting = pending > 0
  const duplicates = orders.length > 1

  return (
    <BugCard
      title="Double-click places duplicate orders"
      symptom="A quick double-click (or an impatient second click) sends two requests and charges the customer twice."
      cause="The button stayed clickable while the first request was still in flight."
      fix="Disable the button while submitting, and guard with a ref so even same-tick clicks are ignored."
      version={version}
      onVersionChange={(next) => {
        setVersion(next)
        reset()
      }}
      code={version === 'buggy' ? doubleBuggyCode : doubleFixedCode}
      onReset={reset}
    >
      <p className="text-xs text-white/50">Click the button 3 times quickly.</p>
      <button
        type="button"
        onClick={handleClick}
        disabled={version === 'fixed' && submitting}
        className={cn(primaryButton, 'w-full')}
      >
        {version === 'fixed' && submitting ? (
          <>
            <Spinner /> Placing order…
          </>
        ) : (
          'Place order'
        )}
      </button>
      <div
        className={cn(
          'rounded-xl border p-3 text-sm',
          duplicates ? 'border-red-500/40 bg-red-500/10 text-red-100' : 'border-white/10 bg-zinc-800/60',
        )}
        aria-live="polite"
      >
        <p className="font-semibold">
          Orders created on the server: <span data-testid="order-count">{orders.length}</span>
          {version === 'buggy' && pending > 0 && <span className="font-normal text-white/50"> ({pending} in flight)</span>}
        </p>
        {duplicates && <p className="mt-1">Duplicate orders! The customer would be charged {orders.length} times.</p>}
        {orders.length > 0 && <p className="mt-1 font-mono text-xs opacity-70">{orders.join(', ')}</p>}
      </div>
    </BugCard>
  )
}

/* ------------------------- shared card ------------------------- */

interface BugCardProps {
  title: string
  symptom: string
  cause: string
  fix: string
  version: Version
  onVersionChange: (version: Version) => void
  code: CodeLine[]
  onReset: () => void
  children: ReactNode
}

function BugCard({ title, symptom, cause, fix, version, onVersionChange, code, onReset, children }: BugCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6">
      <header>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-white/60">{symptom}</p>
      </header>

      <div role="radiogroup" aria-label={`${title}: version`} className="grid grid-cols-2 rounded-full bg-zinc-800 p-1 text-sm">
        {(['buggy', 'fixed'] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={version === option}
            onClick={() => onVersionChange(option)}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition',
              version === option
                ? option === 'buggy'
                  ? 'bg-red-500/90 text-white'
                  : 'bg-emerald-500/90 text-white'
                : 'text-white/60 hover:text-white',
            )}
          >
            {option === 'buggy' ? <Bug aria-hidden="true" className="size-4" /> : <CheckCircle2 aria-hidden="true" className="size-4" />}
            {option === 'buggy' ? 'Before (buggy)' : 'After (fixed)'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">{children}</div>

      <button type="button" onClick={onReset} className="self-start text-xs text-white/50 underline underline-offset-2 hover:text-white">
        Reset demo
      </button>

      <p className="text-sm">
        <span className="font-semibold text-red-300">Cause: </span>
        <span className="text-white/70">{cause}</span>
        <br />
        <span className="font-semibold text-emerald-300">Fix: </span>
        <span className="text-white/70">{fix}</span>
      </p>

      <pre className="overflow-x-auto rounded-xl bg-black/60 p-3 font-mono text-xs leading-relaxed">
        <code>
          {code.map((line, index) => (
            <span
              key={index}
              className={cn(
                'block px-2',
                line.mark === 'bug' && 'bg-red-500/15 text-red-200',
                line.mark === 'fix' && 'bg-emerald-500/15 text-emerald-200',
              )}
            >
              {line.text || ' '}
            </span>
          ))}
        </code>
      </pre>
    </article>
  )
}

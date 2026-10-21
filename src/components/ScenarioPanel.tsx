import { useSyncExternalStore } from 'react'
import { ArrowRight } from 'lucide-react'
import { getRecentRequests, subscribeToRequests, type RequestLogEntry } from '../api/requestLog'
import {
  checkoutScenarios,
  menuScenarios,
  type CheckoutScenario,
  type MenuScenario,
  type ScenarioOption,
} from '../api/scenarios'
import { cn } from '../lib/styles'

interface ScenarioPanelProps {
  checkoutScenario: CheckoutScenario
  onCheckoutScenarioChange: (scenario: CheckoutScenario) => void
  menuScenario: MenuScenario
  onMenuScenarioChange: (scenario: MenuScenario) => void
  slowNetwork: boolean
  onSlowNetworkChange: (slow: boolean) => void
}

export function ScenarioPanel(props: ScenarioPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-semibold">Demo controls</h2>
        <p className="mt-1 text-xs text-white/50">Choose how the fake API responds, then use the checkout.</p>
      </div>

      <ScenarioGroup
        name="checkout-scenario"
        legend="Checkout: POST /api/orders"
        options={checkoutScenarios}
        value={props.checkoutScenario}
        onChange={props.onCheckoutScenarioChange}
        note="Client-side validation runs before any request is sent. Submit the empty form to see it."
      />

      <ScenarioGroup
        name="menu-scenario"
        legend="Menu: GET /api/menu"
        options={menuScenarios}
        value={props.menuScenario}
        onChange={props.onMenuScenarioChange}
      />

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-zinc-800/60 px-3 py-2.5 text-sm">
        <span>
          <span className="font-medium">Slow network</span>
          <span className="block text-xs text-white/50">3s instead of 1s per request</span>
        </span>
        <input
          type="checkbox"
          checked={props.slowNetwork}
          onChange={(event) => props.onSlowNetworkChange(event.target.checked)}
          className="size-4 accent-orange-500"
        />
      </label>

      <RequestLog />

      <a href="/bug-fixes" className="flex items-center gap-1.5 text-sm font-medium text-orange-400 hover:text-orange-300">
        See the bug fixes, before and after <ArrowRight aria-hidden="true" className="size-4" />
      </a>
    </div>
  )
}

interface ScenarioGroupProps<T extends string> {
  name: string
  legend: string
  options: ScenarioOption<T>[]
  value: T
  onChange: (value: T) => void
  note?: string
}

function ScenarioGroup<T extends string>({ name, legend, options, value, onChange, note }: ScenarioGroupProps<T>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-mono text-xs text-white/60">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 text-sm transition',
            value === option.value ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-white/25',
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="mt-1 accent-orange-500"
          />
          <span>
            <span className="font-medium">{option.label}</span>
            <span className="block text-xs text-white/50">{option.detail}</span>
          </span>
        </label>
      ))}
      {note && <p className="text-xs text-white/40">{note}</p>}
    </fieldset>
  )
}

function outcomeLabel(outcome: RequestLogEntry['outcome']) {
  if (outcome === 'network-error') return { text: 'failed', className: 'text-zinc-300' }
  if (outcome === 'aborted') return { text: 'aborted', className: 'text-white/40' }
  if (outcome >= 500) return { text: String(outcome), className: 'text-red-400' }
  if (outcome >= 400) return { text: String(outcome), className: 'text-amber-400' }
  return { text: String(outcome), className: 'text-emerald-400' }
}

function RequestLog() {
  const entries = useSyncExternalStore(subscribeToRequests, getRecentRequests)

  return (
    <section aria-label="Request log" className="flex flex-col gap-2">
      <h3 className="font-mono text-xs text-white/60">Request log</h3>
      {entries.length === 0 ? (
        <p className="text-xs text-white/40">No requests yet.</p>
      ) : (
        <ol className="flex flex-col gap-1 font-mono text-xs">
          {entries.map((entry) => {
            const outcome = outcomeLabel(entry.outcome)
            return (
              <li key={entry.id} className="flex items-center gap-2 rounded bg-black/40 px-2 py-1">
                <span className="w-9 text-white/50">{entry.method}</span>
                <span className="flex-1 truncate">{entry.path}</span>
                <span className={outcome.className}>{outcome.text}</span>
                <span className="w-12 text-right text-white/40">{entry.durationMs}ms</span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

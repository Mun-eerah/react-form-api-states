import { useEffect, useState } from 'react'
import { RefreshCw, UtensilsCrossed } from 'lucide-react'
import { getMenu } from '../api/api'
import { ApiError, NetworkError, isAbortError } from '../api/client'
import type { MenuScenario } from '../api/scenarios'
import { formatPrice, type Burger } from '../data/burgers'
import { outlineButton } from '../lib/styles'
import { Alert } from './ui'

type MenuState =
  | { status: 'loading' }
  | { status: 'success'; items: Burger[] }
  | { status: 'error'; message: string }

function useMenu(scenario: MenuScenario, latencyMs: number) {
  const [state, setState] = useState<MenuState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    // Aborting on cleanup means a slow, outdated response can never
    // overwrite the result of a newer request.
    const controller = new AbortController()
    setState({ status: 'loading' })

    getMenu(scenario, { latencyMs, signal: controller.signal })
      .then((items) => setState({ status: 'success', items }))
      .catch((err: unknown) => {
        if (isAbortError(err)) return
        const message =
          err instanceof NetworkError
            ? 'Check your connection and try again.'
            : err instanceof ApiError
              ? `The menu service responded with ${err.status}. Please try again in a moment.`
              : 'Something unexpected went wrong.'
        setState({ status: 'error', message })
      })

    return () => controller.abort()
  }, [scenario, latencyMs, reloadKey])

  return { state, reload: () => setReloadKey((key) => key + 1) }
}

export function MenuList({ scenario, latencyMs }: { scenario: MenuScenario; latencyMs: number }) {
  const { state, reload } = useMenu(scenario, latencyMs)

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-semibold">
          Today&apos;s menu
          {state.status === 'success' && state.items.length > 0 && (
            <span className="ml-2 text-sm font-normal text-white/50">{state.items.length} items</span>
          )}
        </h3>
        <button type="button" onClick={reload} disabled={state.status === 'loading'} className={outlineButton}>
          <RefreshCw aria-hidden="true" className={state.status === 'loading' ? 'size-4 animate-spin' : 'size-4'} />
          Reload
        </button>
      </div>

      <div aria-live="polite" aria-busy={state.status === 'loading'}>
        {state.status === 'loading' && <MenuSkeleton />}

        {state.status === 'error' && (
          <Alert
            tone="error"
            title="Couldn't load the menu"
            action={
              <button type="button" onClick={reload} className={outlineButton}>
                Retry
              </button>
            }
          >
            {state.message}
          </Alert>
        )}

        {state.status === 'success' && state.items.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 px-6 py-12 text-center">
            <UtensilsCrossed aria-hidden="true" className="size-8 text-orange-400" />
            <p className="font-semibold">No burgers on the menu yet</p>
            <p className="max-w-xs text-sm text-white/50">The kitchen is still setting up. New items will show up here as soon as they're added.</p>
          </div>
        )}

        {state.status === 'success' && state.items.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {state.items.map((burger) => (
              <li key={burger.id} className="flex flex-col items-center rounded-xl bg-zinc-800/60 p-4 text-center">
                <img src={burger.src} alt={burger.name} className="h-20 w-full object-contain" />
                <p className="mt-3 text-sm font-bold uppercase text-orange-500">{burger.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-white/50">{burger.description}</p>
                <p className="mt-2 font-semibold">{formatPrice(burger.price)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function MenuSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3" aria-label="Loading menu">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index} className="flex animate-pulse flex-col items-center rounded-xl bg-zinc-800/60 p-4">
          <div className="size-20 rounded-full bg-zinc-700" />
          <div className="mt-3 h-3 w-3/4 rounded bg-zinc-700" />
          <div className="mt-2 h-2.5 w-full rounded bg-zinc-700/70" />
          <div className="mt-3 h-3 w-1/3 rounded bg-zinc-700" />
        </li>
      ))}
    </ul>
  )
}

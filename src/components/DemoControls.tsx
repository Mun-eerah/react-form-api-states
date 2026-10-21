import { useEffect, useState, type ComponentProps } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { ScenarioPanel } from './ScenarioPanel'

/**
 * The scenario panel stays out of the way until someone asks for it, so the
 * page reads as a normal checkout. It isn't modal: you can change a scenario
 * and use the form with the panel still open.
 */
export function DemoControls(props: ComponentProps<typeof ScenarioPanel>) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          id="demo-controls"
          role="dialog"
          aria-label="Demo controls"
          className="max-h-[calc(100dvh-6rem)] w-[min(340px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-orange-500/30 bg-zinc-900 p-5 shadow-2xl shadow-black"
        >
          <ScenarioPanel {...props} />
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="demo-controls"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-zinc-800 px-4 py-2 text-sm font-medium shadow-lg shadow-black/50 transition hover:border-orange-400 hover:text-orange-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
      >
        {open ? <X aria-hidden="true" className="size-4" /> : <SlidersHorizontal aria-hidden="true" className="size-4" />}
        {open ? 'Close' : 'Demo controls'}
      </button>
    </div>
  )
}

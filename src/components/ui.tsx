import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Loader2, WifiOff, X } from 'lucide-react'
import { cn } from '../lib/styles'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 aria-hidden="true" className={cn('size-4 animate-spin', className)} />
}

type AlertTone = 'error' | 'warning' | 'success' | 'offline'

const toneStyles: Record<AlertTone, { box: string; icon: ReactNode }> = {
  error: { box: 'border-red-500/40 bg-red-500/10 text-red-100', icon: <AlertCircle className="size-5 text-red-400" /> },
  warning: { box: 'border-amber-500/40 bg-amber-500/10 text-amber-100', icon: <AlertCircle className="size-5 text-amber-400" /> },
  success: { box: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100', icon: <CheckCircle2 className="size-5 text-emerald-400" /> },
  offline: { box: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-100', icon: <WifiOff className="size-5 text-zinc-300" /> },
}

interface AlertProps {
  tone: AlertTone
  title: string
  children?: ReactNode
  action?: ReactNode
  onDismiss?: () => void
}

export function Alert({ tone, title, children, action, onDismiss }: AlertProps) {
  const style = toneStyles[tone]
  return (
    <div role={tone === 'success' ? 'status' : 'alert'} className={cn('flex gap-3 rounded-xl border p-4', style.box)}>
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {style.icon}
      </span>
      <div className="flex-1 text-sm">
        <p className="font-semibold">{title}</p>
        {children && <div className="mt-1 opacity-80">{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="self-start rounded p-1 opacity-70 hover:opacity-100">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

export function SectionHeading({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return (
    <header className="mb-5">
      <p className="font-mono text-xs uppercase tracking-widest text-orange-400">{step}</p>
      <h2 className="mt-1 text-2xl font-bold">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-white/60">{children}</p>
    </header>
  )
}

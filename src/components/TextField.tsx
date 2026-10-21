import type { InputHTMLAttributes, Ref } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '../lib/styles'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  hint?: string
  ref?: Ref<HTMLInputElement>
}

export function TextField({ id, label, error, hint, className, ref, ...inputProps }: TextFieldProps) {
  const hintId = hint && !error ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white/80">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
        className={cn(
          'rounded-md border bg-zinc-800 px-4 py-3 text-white placeholder:text-white/40 transition focus:outline-none disabled:opacity-60',
          error ? 'border-red-500 focus:border-red-400' : 'border-zinc-700 focus:border-orange-500',
          className,
        )}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-sm text-red-400">
          <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-xs text-white/40">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

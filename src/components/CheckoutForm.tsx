import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { placeOrder, type OrderConfirmation } from '../api/api'
import { ApiError, NetworkError, isAbortError } from '../api/client'
import type { CheckoutScenario } from '../api/scenarios'
import { burgers, formatPrice } from '../data/burgers'
import {
  checkoutFields,
  emptyCheckout,
  pickFieldErrors,
  validateCheckout,
  type CheckoutField,
  type CheckoutValues,
  type FieldErrors,
} from '../lib/checkout'
import { TextField } from './TextField'
import { outlineButton, primaryButton } from '../lib/styles'
import { Alert, Spinner } from './ui'

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'invalid'; message: string }
  | { status: 'failed'; kind: 'server' | 'network'; message: string }
  | { status: 'success'; order: OrderConfirmation }

interface CheckoutFormProps {
  scenario: CheckoutScenario
  latencyMs: number
}

const fieldConfig: Record<CheckoutField, { label: string; type: string; autoComplete: string; placeholder: string; hint?: string }> = {
  fullName: { label: 'Full name', type: 'text', autoComplete: 'name', placeholder: 'Ada Lovelace' },
  email: { label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'ada@example.com', hint: 'We send the receipt here.' },
  phone: { label: 'Phone number', type: 'tel', autoComplete: 'tel', placeholder: '0801 234 5678' },
  address: { label: 'Delivery address', type: 'text', autoComplete: 'street-address', placeholder: '12 Admiralty Way, Lekki' },
}

const ORDER_ITEM = burgers[0]
const ORDER_QTY = 2
const DELIVERY_FEE = 2.5

export function CheckoutForm({ scenario, latencyMs }: CheckoutFormProps) {
  const [values, setValues] = useState<CheckoutValues>(emptyCheckout)
  const [touched, setTouched] = useState<Partial<Record<CheckoutField, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [serverErrors, setServerErrors] = useState<FieldErrors>({})
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' })

  // A ref, not state: it updates synchronously, so a fast double click
  // can't sneak a second request in before React re-renders.
  const inFlight = useRef(false)
  const controllerRef = useRef<AbortController | null>(null)
  const inputRefs = useRef<Partial<Record<CheckoutField, HTMLInputElement | null>>>({})
  const focusAfterRender = useRef<CheckoutField | null>(null)

  // Abort any in-flight request if the form unmounts.
  useEffect(() => () => controllerRef.current?.abort(), [])

  // Inputs are disabled while submitting, so focus has to wait until the
  // render that re-enables them.
  useEffect(() => {
    if (focusAfterRender.current && submit.status !== 'submitting') {
      inputRefs.current[focusAfterRender.current]?.focus()
      focusAfterRender.current = null
    }
  })

  const clientErrors = validateCheckout(values)
  const isSubmitting = submit.status === 'submitting'

  const errorFor = (field: CheckoutField) =>
    serverErrors[field] ?? (touched[field] || submitAttempted ? clientErrors[field] : undefined)

  const handleChange = (field: CheckoutField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    // A server error is about the old value, so drop it once the user edits the field.
    if (serverErrors[field]) {
      setServerErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
    }
  }

  const send = async (payload: CheckoutValues) => {
    if (inFlight.current) return
    inFlight.current = true

    const controller = new AbortController()
    controllerRef.current = controller
    setServerErrors({})
    setSubmit({ status: 'submitting' })

    try {
      const order = await placeOrder(payload, scenario, { latencyMs, signal: controller.signal })
      setSubmit({ status: 'success', order })
      setValues(emptyCheckout)
      setTouched({})
      setSubmitAttempted(false)
    } catch (err) {
      if (isAbortError(err)) return

      if (err instanceof ApiError && err.status === 400) {
        const fieldErrors = pickFieldErrors(err.fieldErrors)
        setServerErrors(fieldErrors)
        setSubmit({ status: 'invalid', message: err.message })
        focusAfterRender.current = checkoutFields.find((field) => fieldErrors[field]) ?? null
      } else if (err instanceof NetworkError) {
        setSubmit({
          status: 'failed',
          kind: 'network',
          message: "We couldn't reach the server. Check your connection, then try again. Your details are still here.",
        })
      } else {
        const status = err instanceof ApiError ? ` (error ${err.status})` : ''
        setSubmit({
          status: 'failed',
          kind: 'server',
          message: `Something went wrong on our side${status}. Your order was not placed and you have not been charged.`,
        })
      }
    } finally {
      inFlight.current = false
    }
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    attemptSubmit()
  }

  // Used by both the submit button and "Try again", so a retry is
  // validated the same way as the first attempt.
  const attemptSubmit = () => {
    if (inFlight.current) return

    setSubmitAttempted(true)
    const firstInvalid = checkoutFields.find((field) => clientErrors[field])
    if (firstInvalid) {
      inputRefs.current[firstInvalid]?.focus()
      return
    }
    void send(values)
  }

  const subtotal = ORDER_ITEM.price * ORDER_QTY

  return (
    <form noValidate onSubmit={handleSubmit} aria-busy={isSubmitting} className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6">
      <div className="flex items-center gap-4 rounded-xl border-2 border-dashed border-orange-500/60 p-3">
        <img src={ORDER_ITEM.src} alt="" className="size-14 shrink-0 object-contain" />
        <div className="flex-1 text-sm">
          <p className="font-bold uppercase text-orange-500">{ORDER_ITEM.name}</p>
          <p className="text-white/60">
            {ORDER_QTY} × {formatPrice(ORDER_ITEM.price)} + {formatPrice(DELIVERY_FEE)} delivery
          </p>
        </div>
        <p className="text-lg font-bold">{formatPrice(subtotal + DELIVERY_FEE)}</p>
      </div>

      <div aria-live="polite" className="empty:hidden">
        {submit.status === 'success' && (
          <Alert tone="success" title={`Order ${submit.order.id} confirmed`} onDismiss={() => setSubmit({ status: 'idle' })}>
            Your burgers arrive in about {submit.order.etaMinutes} minutes. The form has been cleared for a new order.
          </Alert>
        )}
        {submit.status === 'invalid' && (
          <Alert tone="warning" title={submit.message}>
            Fix the highlighted {Object.keys(serverErrors).length === 1 ? 'field' : 'fields'} below and submit again.
          </Alert>
        )}
        {submit.status === 'failed' && (
          <Alert
            tone={submit.kind === 'network' ? 'offline' : 'error'}
            title={submit.kind === 'network' ? "You're offline" : "We couldn't place your order"}
            action={
              <button type="button" onClick={attemptSubmit} className={outlineButton}>
                Try again
              </button>
            }
          >
            {submit.message}
          </Alert>
        )}
      </div>

      <fieldset disabled={isSubmitting} className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Delivery details</legend>
        {checkoutFields.map((field) => {
          const config = fieldConfig[field]
          return (
            <div key={field} className={field === 'address' ? 'sm:col-span-2' : undefined}>
              <TextField
                id={`checkout-${field}`}
                name={field}
                ref={(node) => {
                  inputRefs.current[field] = node
                }}
                label={config.label}
                type={config.type}
                autoComplete={config.autoComplete}
                placeholder={config.placeholder}
                hint={config.hint}
                value={values[field]}
                error={errorFor(field)}
                onChange={(event) => handleChange(field, event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, [field]: true }))}
              />
            </div>
          )
        })}
      </fieldset>

      <button type="submit" disabled={isSubmitting} className={primaryButton}>
        {isSubmitting ? (
          <>
            <Spinner /> Placing order…
          </>
        ) : (
          `Place order · ${formatPrice(subtotal + DELIVERY_FEE)}`
        )}
      </button>
    </form>
  )
}

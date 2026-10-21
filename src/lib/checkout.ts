export interface CheckoutValues {
  fullName: string
  email: string
  phone: string
  address: string
}

export type CheckoutField = keyof CheckoutValues
export type FieldErrors = Partial<Record<CheckoutField, string>>

/** Field order matters: it decides which invalid field gets focus first. */
export const checkoutFields: CheckoutField[] = ['fullName', 'email', 'phone', 'address']

export const emptyCheckout: CheckoutValues = { fullName: '', email: '', phone: '', address: '' }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateField(field: CheckoutField, rawValue: string): string | undefined {
  const value = rawValue.trim()

  switch (field) {
    case 'fullName':
      if (!value) return 'Enter your full name.'
      if (value.length < 2) return 'Name must be at least 2 characters.'
      return
    case 'email':
      if (!value) return 'Enter your email address.'
      if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email, like name@example.com.'
      return
    case 'phone': {
      if (!value) return 'Enter a phone number so the rider can reach you.'
      const digits = value.replace(/[\s()+-]/g, '')
      if (!/^\d+$/.test(digits)) return 'Phone number can only contain digits, spaces, +, - and brackets.'
      if (digits.length !== 11) return 'Phone number must be 11 digits.'
      return
    }
    case 'address':
      if (!value) return 'Enter a delivery address.'
      if (value.length < 10) return 'Add more detail, such as street and house number.'
      return
  }
}

export function validateCheckout(values: CheckoutValues): FieldErrors {
  const errors: FieldErrors = {}
  for (const field of checkoutFields) {
    const error = validateField(field, values[field])
    if (error) errors[field] = error
  }
  return errors
}

/** Keep only the server errors that belong to fields this form knows about. */
export function pickFieldErrors(serverErrors: Record<string, string>): FieldErrors {
  const errors: FieldErrors = {}
  for (const field of checkoutFields) {
    if (serverErrors[field]) errors[field] = serverErrors[field]
  }
  return errors
}

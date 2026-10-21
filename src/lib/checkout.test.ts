import { describe, expect, it } from 'vitest'
import { pickFieldErrors, validateCheckout, validateField } from './checkout'

describe('validateField', () => {
  it('requires every field', () => {
    expect(validateField('fullName', '  ')).toBe('Enter your full name.')
    expect(validateField('email', '')).toBe('Enter your email address.')
    expect(validateField('phone', '')).toMatch(/phone number/i)
    expect(validateField('address', '')).toBe('Enter a delivery address.')
  })

  it('checks email format', () => {
    expect(validateField('email', 'ada@')).toMatch(/valid email/i)
    expect(validateField('email', 'ada@example.com')).toBeUndefined()
  })

  it('accepts 11-digit numbers with spacing and rejects letters or wrong lengths', () => {
    expect(validateField('phone', '0801 234 5678')).toBeUndefined()
    expect(validateField('phone', '(080) 1234-5678')).toBeUndefined()
    expect(validateField('phone', '0801abc5678')).toMatch(/only contain digits/i)
    expect(validateField('phone', '12345')).toMatch(/11 digits/i)
    expect(validateField('phone', '+234 801 234 5678')).toMatch(/11 digits/i)
  })
})

describe('validateCheckout', () => {
  it('returns no errors for a valid form', () => {
    expect(
      validateCheckout({ fullName: 'Ada Lovelace', email: 'ada@example.com', phone: '08012345678', address: '12 Admiralty Way' }),
    ).toEqual({})
  })
})

describe('pickFieldErrors', () => {
  it('ignores server errors for fields the form does not have', () => {
    expect(pickFieldErrors({ email: 'Taken', couponCode: 'Expired' })).toEqual({ email: 'Taken' })
  })
})

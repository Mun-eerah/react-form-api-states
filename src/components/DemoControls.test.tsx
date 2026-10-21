import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CheckoutPage } from '../pages/CheckoutPage'

describe('Demo controls', () => {
  it('are hidden until the button is clicked, and close with Escape', async () => {
    const user = userEvent.setup()
    render(<CheckoutPage />)

    expect(screen.queryByRole('dialog', { name: 'Demo controls' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Demo controls' }))
    expect(screen.getByRole('dialog', { name: 'Demo controls' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Demo controls' })).not.toBeInTheDocument()
  })

  it('change how the fake API responds', async () => {
    const user = userEvent.setup()
    render(<CheckoutPage />)

    await user.click(screen.getByRole('button', { name: 'Demo controls' }))
    await user.click(screen.getByRole('radio', { name: /^Empty/ }))

    expect(await screen.findByText('No burgers on the menu yet', {}, { timeout: 3000 })).toBeInTheDocument()
  })
})

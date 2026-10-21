import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { BugFixDemos } from './BugFixDemos'

const card = (title: RegExp) => screen.getByRole('heading', { name: title }).closest('article') as HTMLElement

describe('Bug: button stuck on loading', () => {
  it('buggy version stays disabled after the error', async () => {
    const user = userEvent.setup()
    render(<BugFixDemos latencyMs={20} />)
    const demo = within(card(/stuck/i))

    await user.click(demo.getByRole('button', { name: 'Place order' }))

    expect(await demo.findByText('Server error (500). Please try again.')).toBeInTheDocument()
    expect(demo.getByRole('button', { name: /placing order/i })).toBeDisabled()
  })

  it('fixed version lets the user try again', async () => {
    const user = userEvent.setup()
    render(<BugFixDemos latencyMs={20} />)
    const demo = within(card(/stuck/i))

    await user.click(demo.getByRole('radio', { name: /after \(fixed\)/i }))
    await user.click(demo.getByRole('button', { name: 'Place order' }))

    expect(await demo.findByRole('button', { name: 'Try again' })).toBeEnabled()
  })
})

describe('Bug: double submit', () => {
  it('buggy version creates one order per click', async () => {
    const user = userEvent.setup()
    render(<BugFixDemos latencyMs={50} />)
    const demo = within(card(/duplicate/i))
    const button = demo.getByRole('button', { name: 'Place order' })

    await user.tripleClick(button)

    await waitFor(() => expect(demo.getByTestId('order-count')).toHaveTextContent('3'))
    expect(demo.getByText(/Duplicate orders!/)).toBeInTheDocument()
  })

  it('fixed version creates exactly one order', async () => {
    const user = userEvent.setup()
    render(<BugFixDemos latencyMs={50} />)
    const demo = within(card(/duplicate/i))

    await user.click(demo.getByRole('radio', { name: /after \(fixed\)/i }))
    await user.tripleClick(demo.getByRole('button', { name: 'Place order' }))

    expect(await demo.findByRole('button', { name: 'Place order' })).toBeEnabled()
    expect(demo.getByTestId('order-count')).toHaveTextContent('1')
  })
})

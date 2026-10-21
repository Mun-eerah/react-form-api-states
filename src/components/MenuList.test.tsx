import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MenuList } from './MenuList'

describe('MenuList', () => {
  it('shows a skeleton, then the items', async () => {
    render(<MenuList scenario="success" latencyMs={20} />)

    expect(screen.getByLabelText('Loading menu')).toBeInTheDocument()
    expect(await screen.findByText('Double Layer Burger')).toBeInTheDocument()
    expect(screen.queryByLabelText('Loading menu')).not.toBeInTheDocument()
  })

  it('shows an empty state when the API returns no items', async () => {
    render(<MenuList scenario="empty" latencyMs={20} />)

    expect(await screen.findByText('No burgers on the menu yet')).toBeInTheDocument()
  })

  it('shows an error with a Retry button that fetches again', async () => {
    const user = userEvent.setup()
    render(<MenuList scenario="error" latencyMs={20} />)

    expect(await screen.findByText("Couldn't load the menu")).toBeInTheDocument()
    expect(screen.getByText(/responded with 503/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(screen.getByLabelText('Loading menu')).toBeInTheDocument()
  })
})

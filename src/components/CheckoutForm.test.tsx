import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { CheckoutScenario } from '../api/scenarios'
import { CheckoutForm } from './CheckoutForm'

const renderForm = (scenario: CheckoutScenario) => render(<CheckoutForm scenario={scenario} latencyMs={50} />)

async function fillValidForm() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace')
  await user.type(screen.getByLabelText('Email'), 'ada@example.com')
  await user.type(screen.getByLabelText('Phone number'), '08012345678')
  await user.type(screen.getByLabelText('Delivery address'), '12 Admiralty Way, Lekki')
  return user
}

const submitButton = () => screen.getByRole('button', { name: /place order/i })

describe('CheckoutForm', () => {
  it('shows inline errors on submit, focuses the first one, and clears each as it is fixed', async () => {
    const user = userEvent.setup()
    renderForm('success')

    await user.click(submitButton())

    const name = screen.getByLabelText('Full name')
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveFocus()
    expect(screen.getByText('Enter your full name.')).toBeInTheDocument()
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()

    await user.type(name, 'Ada')
    expect(screen.queryByText('Enter your full name.')).not.toBeInTheDocument()
    expect(name).not.toHaveAttribute('aria-invalid')
  })

  it('disables the submit button with a spinner while the request is in flight', async () => {
    renderForm('success')
    const user = await fillValidForm()

    await user.click(submitButton())

    const button = screen.getByRole('button', { name: /placing order/i })
    expect(button).toBeDisabled()
    expect(screen.getByLabelText('Email')).toBeDisabled()
  })

  it('confirms the order and resets the form on success', async () => {
    renderForm('success')
    const user = await fillValidForm()

    await user.click(submitButton())

    expect(await screen.findByText(/Order BQ-\d{4} confirmed/)).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toHaveValue('')
    expect(submitButton()).toBeEnabled()
  })

  it('maps a 400 response onto the matching fields and clears a server error when that field is edited', async () => {
    renderForm('validation-error')
    const user = await fillValidForm()

    await user.click(submitButton())

    expect(await screen.findByText('This email is already linked to another account.')).toBeInTheDocument()
    expect(screen.getByText("Sorry, we don't deliver to this area yet.")).toBeInTheDocument()
    await waitFor(() => expect(screen.getByLabelText('Email')).toHaveFocus())

    await user.type(screen.getByLabelText('Email'), 'x')
    expect(screen.queryByText('This email is already linked to another account.')).not.toBeInTheDocument()
    expect(screen.getByText("Sorry, we don't deliver to this area yet.")).toBeInTheDocument()
  })

  it('shows a server error with a working Try again button and keeps what the user typed', async () => {
    renderForm('server-error')
    const user = await fillValidForm()

    await user.click(submitButton())

    expect(await screen.findByText("We couldn't place your order")).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toHaveValue('Ada Lovelace')
    expect(submitButton()).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByRole('button', { name: /placing order/i })).toBeDisabled()
  })

  it('shows an offline message on network failure', async () => {
    renderForm('network-error')
    const user = await fillValidForm()

    await user.click(submitButton())

    expect(await screen.findByText("You're offline")).toBeInTheDocument()
  })
})

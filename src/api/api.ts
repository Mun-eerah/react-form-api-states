import type { Burger } from '../data/burgers'
import type { CheckoutValues } from '../lib/checkout'
import { request } from './client'
import type { RequestOptions } from './mockServer'
import type { CheckoutScenario, MenuScenario } from './scenarios'

export interface OrderConfirmation {
  id: string
  etaMinutes: number
}

export const placeOrder = (values: CheckoutValues, scenario: CheckoutScenario, options: RequestOptions) =>
  request<OrderConfirmation>({ method: 'POST', path: '/api/orders', body: values, scenario }, options)

export const getMenu = (scenario: MenuScenario, options: RequestOptions) =>
  request<Burger[]>({ method: 'GET', path: '/api/menu', scenario }, options)

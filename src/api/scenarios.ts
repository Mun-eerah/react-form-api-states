/**
 * Scenarios tell the fake server how to respond. In a real app the server
 * decides; here the viewer picks from the scenario panel.
 */
export type CheckoutScenario = 'success' | 'validation-error' | 'server-error' | 'network-error'
export type MenuScenario = 'success' | 'slow' | 'empty' | 'error'

export interface ScenarioOption<T extends string> {
  value: T
  label: string
  detail: string
}

export const checkoutScenarios: ScenarioOption<CheckoutScenario>[] = [
  { value: 'success', label: 'Success', detail: '201 · confirmation, form resets' },
  { value: 'validation-error', label: 'API validation error', detail: '400 · errors mapped to fields' },
  { value: 'server-error', label: 'Server error', detail: '500 · message + Try again' },
  { value: 'network-error', label: 'Network failure', detail: 'No response · offline message' },
]

export const menuScenarios: ScenarioOption<MenuScenario>[] = [
  { value: 'success', label: 'Loaded', detail: '200 · list of items' },
  { value: 'slow', label: 'Slow response', detail: 'Skeleton stays up longer' },
  { value: 'empty', label: 'Empty', detail: '200 · empty array' },
  { value: 'error', label: 'Error', detail: '503 · message + Retry' },
]

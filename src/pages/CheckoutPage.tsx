import { useState } from 'react'
import type { CheckoutScenario, MenuScenario } from '../api/scenarios'
import { CheckoutForm } from '../components/CheckoutForm'
import { DemoControls } from '../components/DemoControls'
import { MenuList } from '../components/MenuList'

export function CheckoutPage() {
  const [checkoutScenario, setCheckoutScenario] = useState<CheckoutScenario>('success')
  const [menuScenario, setMenuScenario] = useState<MenuScenario>('success')
  const [slowNetwork, setSlowNetwork] = useState(false)
  const latencyMs = slowNetwork ? 3000 : 1000

  return (
    <>
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 pt-10 pb-24">
        <section>
          <h1 className="text-3xl font-bold md:text-4xl">Checkout</h1>
          <p className="mt-2 mb-6 text-white/60">Almost there. Tell us where to send your burgers.</p>
          <CheckoutForm scenario={checkoutScenario} latencyMs={latencyMs} />
        </section>

        <section id="menu" className="scroll-mt-6">
          <h2 className="mb-4 text-xl font-bold">Add something else?</h2>
          <MenuList scenario={menuScenario} latencyMs={latencyMs} />
        </section>
      </div>

      <DemoControls
        checkoutScenario={checkoutScenario}
        onCheckoutScenarioChange={setCheckoutScenario}
        menuScenario={menuScenario}
        onMenuScenarioChange={setMenuScenario}
        slowNetwork={slowNetwork}
        onSlowNetworkChange={setSlowNetwork}
      />
    </>
  )
}

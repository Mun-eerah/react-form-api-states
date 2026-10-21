import type { ComponentType } from 'react'
import { BugFixesPage } from './pages/BugFixesPage'
import { CheckoutPage } from './pages/CheckoutPage'

// Two pages don't need a router library; vercel.json sends every path to index.html.
const pages: Record<string, ComponentType> = {
  '/': CheckoutPage,
  '/bug-fixes': BugFixesPage,
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const Page = pages[path] ?? CheckoutPage

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="flex justify-center px-4 pt-4">
        <div className="flex w-full max-w-6xl items-center justify-between rounded-full bg-zinc-900 px-4 py-2">
          <a href="/" className="flex items-center gap-1">
            <span className="text-sm font-semibold md:text-lg">
              <span className="text-orange-400">Burger</span>Queen
            </span>
            <img src="/burger-icon.webp" alt="" className="h-6 w-auto" />
          </a>
          <a href="/#menu" className="text-sm text-white/70 hover:text-white">
            Menu
          </a>
        </div>
      </nav>

      <main className="flex-1">
        <Page />
      </main>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/40">
        Demo project. No real orders are placed. · Built with React and TypeScript by Munira Ajumobi
      </footer>
    </div>
  )
}

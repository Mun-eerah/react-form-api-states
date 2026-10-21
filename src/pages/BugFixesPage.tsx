import { ArrowLeft } from 'lucide-react'
import { BugFixDemos } from '../components/BugFixDemos'

export function BugFixesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-20">
      <a href="/" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-orange-300">
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to checkout
      </a>

      <header className="mt-6 mb-8">
        <p className="font-mono text-xs tracking-widest text-orange-400 uppercase">Debugging</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Bug fixes: before / after</h1>
        <p className="mt-3 max-w-2xl text-white/60">
          Two common bugs in real-world forms, rebuilt in this demo. Switch each one between the buggy and fixed
          version, try it, and see the code change that fixes it.
        </p>
      </header>

      <BugFixDemos />
    </div>
  )
}

export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-orange-500'

export const outlineButton =
  'inline-flex items-center justify-center gap-2 rounded-full border-2 border-orange-400 px-4 py-1.5 text-sm font-medium text-orange-400 transition hover:bg-orange-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 disabled:cursor-not-allowed disabled:opacity-60'

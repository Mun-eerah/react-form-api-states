# React + TypeScript Form & API States

> **Demo project.** No real orders are placed. A fake API stands in for the backend, so any response can be tried on demand.

A food-ordering checkout (BurgerQueen) that handles the states real apps run into: validation, loading, API errors, network failures and empty data.

- **Live demo:** _add your Vercel link here_
- **Bug fixes, before/after:** the same link + `/bug-fixes`

On the live demo, open **Demo controls** (bottom right) to choose how the fake API responds.

## States handled

- **Field validation**: inline errors that clear as you fix them, with focus on the first invalid field
- **Loading**: spinner on a disabled submit button, inputs locked, no double submits
- **API validation error (400)**: server errors shown under the matching fields
- **Server error (500) and network failure**: clear message with **Try again**, input kept
- **Success**: confirmation with order number, form resets
- **Data list**: skeleton loader, empty state, error with **Retry**, outdated requests cancelled

## Bugs fixed (see `/bug-fixes`)

1. **Button stuck on "loading" after an error**: loading was only reset on success; moved into `finally`.
2. **Double-click placed duplicate orders**: the button is now disabled during the request, with a ref guard.

## Run it locally

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 20 tests (Vitest + React Testing Library)
```

Built with React 19, TypeScript, Vite and Tailwind CSS.

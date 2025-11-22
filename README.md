# Clicker Web App

Frontend for a Telegram clicker game. Stack: React 18, Vite, TypeScript, MobX, SCSS modules.

## Requirements
- Node.js 22+
- pnpm 10 (see `packageManager` in package.json)

## Setup & Run
```bash
pnpm install
pnpm start      # dev-server (http://localhost:9000)
pnpm build      # tsc && vite build
pnpm preview    # serve prod build
```

Lint & utils:
```bash
pnpm lint:fix   # eslint --fix
pnpm clear:all  # remove node_modules, dist, __generated__/styles
```

## Environment
Copy `.env.example` → `.env` and set:
- `REACT_CLICKER_ENV` — `development` | `production`
- `REACT_CLICKER_BASE_TELEGRAM_GAME_ENDPOINT_URL` — backend base URL (e.g. `http://localhost:3000`)
- `REACT_CLICKER_ENABLE_MOCK` — `true` to run mock mode (no Telegram auth, mock data, no API calls)
- `REACT_CLICKER_AVOID_TELEGRAM_AUTH` — skip Telegram auth (dev)
- `REACT_CLICKER_AVOID_UNSUPPORTED_SCREEN` — skip “Unsupported” screen

## Key Files
- `src/index.tsx` — app entry, inversify DI, mock-telegram hookup in dev+mock
- Stores: `src/app/*/*.store.ts` (MobX)
- Styles: `*.module.scss` with typed generation (vite-plugin-sass-dts)
- i18n: `src/i18n/config.ts`, typed helper `@localization/typed-translation`

## Mock Mode
If `REACT_CLICKER_ENABLE_MOCK=true`:
- User is initialized locally without API calls
- Energy regeneration/balance updates run locally; server sync is skipped

## TODO
- Need test with server after huge rework.

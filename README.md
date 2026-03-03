# MovieVerse Monorepo (Web + Mobile + API)

- **apps/web**: Next.js web app (MetaMask-only auth via SIWE)
- **apps/mobile**: Expo (React Native) app (SDK **54.0.0**)
- **apps/api**: Fastify backend + Prisma SQLite, SIWE auth + TMDB proxy endpoints

## Install
```bash
pnpm install
```

## Env
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

## DB + Run
```bash
pnpm db:migrate
pnpm dev:api
pnpm dev:web
pnpm dev:mobile
```

Mobile on a phone needs `EXPO_PUBLIC_API_BASE_URL` as your LAN IP (not localhost).

# Contributing

Thanks for helping improve Seven Wonders Companion! 🎉

## Setup
- Node 20 (see `.nvmrc`), npm installed
- `npm ci`
- `npx expo start`

## Branching
- `main`: stable, released
- `develop`: next
- Features: `feat/<name>`; Fixes: `fix/<name>`

## Commits & PRs
- Prefer Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- Open PRs to `develop`, include screenshots/screen recordings for UI
- Link related issues (e.g., `Fixes #123`)

## Quality checks
```bash
npm run check    # typecheck + lint + tests
```

## Tests
- Jest + Testing Library are configured; see `__tests__/`
- Add tests for logic where practical

## Code style
- ESLint (Expo base) + React Hooks rules enabled


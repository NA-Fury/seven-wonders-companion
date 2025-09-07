# Seven Wonders Companion

A free companion app for Seven Wonders players. Set up games, seat players, select wonders and expansions, and track scoring quickly.

## Install

```bash
npm ci
npx expo start
```

## Build (EAS)

```bash
eas build --platform ios
eas build --platform android
```

## Feedback & Bugs

- In-app: Settings → Feedback → “Report a Bug (prefilled)”
- GitHub: open Issues → Bug report template
- Discussions: ask questions and share ideas

## Contributing

See `CONTRIBUTING.md` for setup, branching, and quality checks. Please follow Conventional Commits where possible.

## Security

See `SECURITY.md` for reporting vulnerabilities.

## Roadmap

See `ROADMAP.md` for near-term and future plans (including potential paid features).

## License

MIT (see `LICENSE`).

## ESLint (Flat Config)
- Uses ESLint’s flat config via `eslint.config.js` (Expo SDK 50+ style).
- Path alias `@/` is resolved through:
  - TypeScript: `tsconfig.json` with `baseUrl: "."` and `paths: { "@/*": ["./*"] }`.
  - ESLint: `settings['import/resolver']` for `typescript`, `alias` (`@` -> `./`), and `node`.
  - Babel: `babel-plugin-module-resolver` with `alias: { '@': './' }` for runtime/editor parity.
- Commands:
  - `npm run lint` — ESLint
  - `npm run typecheck` — TypeScript
- Note: Legacy `.eslintrc` has been removed so the flat config is consistently applied.

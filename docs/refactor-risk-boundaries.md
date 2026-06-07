# Crossify Refactor Risk Boundaries

This project still has a legacy static runtime in `index.html` and `public/assets/index-DsrIxxwV.js`.
Treat those files as compatibility artifacts. New work should land in `src/lib`, `src/hooks`, or focused components first, then be bridged into the static runtime only when the existing local UI requires it.

Guardrails:

- Keep `src/App.tsx` from growing. Extract new behavior into hooks or pure `src/lib` modules with tests.
- Keep `window.__cx*` access inside `src/runtime-compat/` bridge modules. Do not add scattered global writes.
- Do not add new `@ts-nocheck` or broad `eslint-disable` files.
- Run `npm run check:risk-budget` with the normal regression suite before accepting large refactors.
- If a compatibility patch must touch `index.html` or `public/assets/index-DsrIxxwV.js`, add or update a marker check in `tools/` first.

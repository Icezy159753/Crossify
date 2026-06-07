# Crossify Development Readiness

## Objective

Use GoalBuddy to structure the next phase of Crossify development: keep the current working app stable, identify the safest high-value improvements, execute bounded verified slices, and avoid unscoped rewrites.

## Original Request

"เอามาช่วยเลยรันเลย" after asking whether `tolibear/goalbuddy` can help.

## Intake Summary

- Input shape: `specific`
- Audience: Crossify maintainer and day-to-day app user.
- Authority: `approved`
- Proof type: `test`
- Completion proof: GoalBuddy board exists, the active task is ready for `/goal`, and future implementation slices require receipts plus test/build/lint verification.
- Likely misfire: GoalBuddy could only create process artifacts and never advance safe product work, or it could over-refactor the large app entry file without preserving current behavior.
- Blind spots considered: existing dirty worktree, large `src/App.tsx`, disabled type/lint checks in that file, Thai text encoding damage, and the already-running local Vite server on port 5173.
- Existing plan facts: The app currently passes `npm test`, `npm run build`, and `npm run lint`; local server is available at `http://localhost:5173/`.

## Goal Kind

`specific`

## Current Tranche

Prepare and run a durable GoalBuddy workflow for Crossify development. The first safe slice is read-only discovery, followed by a Judge-selected Worker task with explicit allowed files and verification commands. Continue through safe verified slices until a final audit proves the selected development tranche is complete.

## Non-Negotiable Constraints

- Preserve existing user changes in the dirty worktree.
- Do not revert or delete unrelated generated assets, datasets, or local scripts.
- Keep changes small and directly tied to the selected task.
- Prefer existing React/Vite/Vitest project patterns.
- Verify with `npm test`, `npm run build`, and `npm run lint` when the slice touches app behavior or TypeScript/React code.
- Treat `src/App.tsx` as high-risk because it is large and currently has `/* eslint-disable */` and `// @ts-nocheck`.
- Keep the local dev server on port 5173 available when practical.

## Stop Rule

Stop only when a final audit proves the full selected Crossify development tranche is complete.

Do not stop after planning, discovery, or Judge selection if the user asked for working software or automation and a safe Worker task can be activated.

Do not stop after a single verified Worker slice when the broader owner outcome still has safe local follow-up slices. After each slice audit, advance the board to the next highest-leverage safe Worker task and continue.

Do not stop because a slice needs owner input, credentials, production access, destructive operations, or policy decisions. Mark that exact slice blocked with a receipt, create the smallest safe follow-up or workaround task, and continue all local, non-destructive work that can still move the goal toward the full outcome.

## Canonical Board

Machine truth lives at:

`docs/goals/crossify-development-readiness/state.yaml`

If this charter and `state.yaml` disagree, `state.yaml` wins for task status, active task, receipts, verification freshness, and completion truth.

## Run Command

```text
/goal Follow docs/goals/crossify-development-readiness/goal.md.
```

## PM Loop

On every `/goal` continuation:

1. Read this charter.
2. Read `state.yaml`.
3. Re-check the intake: original request, input shape, authority, proof, blind spots, existing plan facts, and likely misfire.
4. Work only on the active board task.
5. Assign Scout, Judge, Worker, or PM according to the task.
6. Write a compact task receipt.
7. Update the board.
8. If Judge selected a safe Worker task with `allowed_files`, `verify`, and `stop_if`, activate it and continue unless blocked.
9. Treat a slice audit as a checkpoint, not completion, unless it explicitly proves the full original outcome is complete.
10. Finish only with a Judge/PM audit receipt that maps receipts and verification back to the original user outcome and records `full_outcome_complete: true`.

# Crossify System Refactor

## Objective

Refactor Crossify in small verified slices so the codebase becomes easier to maintain while every existing user-facing workflow keeps working. Find and fix concrete bugs as they are discovered, but do not claim every possible bug is fixed without evidence.

## Original Request

"ตรวจสอบและ Refactor code ทั้งระบบให้ดูแลง่ายขึ้นและไม่พังทุกอย่างต้องใช้งานได้เหมือนเดิม และแก้ Bug ทุกฟังชั่นที่มี ถ้าเจอ Bug หลักๆคือ Refactor Code"

## Intake Summary

- Input shape: `specific`
- Audience: Crossify maintainer and users working with SPSS crosstab workflows.
- Authority: `approved`
- Proof type: `test`
- Completion proof: Each refactor slice has a receipt, passes relevant tests/build/lint, and final audit maps preserved behavior plus fixed bugs back to the request.
- Likely misfire: Over-refactor the whole app at once, break existing behavior, or spend time on cosmetic cleanup instead of maintainability and concrete bugs.
- Blind spots considered: current dirty worktree, large `src/App.tsx`, disabled checking in `src/App.tsx`, generated assets and local data files, and the need to keep the running local app behavior unchanged.
- Existing plan facts: GoalBuddy is installed and ready; prior baseline passed `npm test`, `npm run build`, and `npm run lint`; local server is running on port 5173.

## Goal Kind

`specific`

## Current Tranche

Start with a system audit and dependency map, then perform the first small safe refactor slice with tests. Continue slice by slice rather than attempting a whole-system rewrite in one patch.

## Non-Negotiable Constraints

- Preserve existing user changes; never revert unrelated dirty work.
- Keep user-facing behavior the same unless a verified bug fix requires a change.
- Avoid broad rewrites of `src/App.tsx` until dependencies and behavior are mapped.
- Touch only files allowed by the active Worker task.
- Prefer extracting pure helpers with existing tests before changing UI behavior.
- Verify every slice with the narrowest relevant tests plus broader checks when risk warrants.
- Local app at `http://localhost:5173/` should remain usable.

## Stop Rule

Stop only when a final audit proves the current refactor tranche is complete.

Do not stop after planning, discovery, or Judge selection if a safe Worker task can be activated.

Do not stop after one verified slice if safe follow-up slices remain and the tranche is not complete.

Do not claim all bugs are fixed. Record concrete fixed bugs and remaining unknowns.

## Canonical Board

Machine truth lives at:

`docs/goals/crossify-system-refactor/state.yaml`

If this charter and `state.yaml` disagree, `state.yaml` wins for task status, active task, receipts, verification freshness, and completion truth.

## Run Command

```text
/goal Follow docs/goals/crossify-system-refactor/goal.md.
```

## PM Loop

On every `/goal` continuation:

1. Read this charter.
2. Read `state.yaml`.
3. Work only on the active board task.
4. Assign Scout, Judge, Worker, or PM according to the task.
5. Write a compact task receipt.
6. Update the board.
7. If Judge selects a safe Worker task with `allowed_files`, `verify`, and `stop_if`, activate it and continue unless blocked.
8. Treat a slice audit as a checkpoint, not completion, unless it proves the tranche is complete.
9. Finish only with a Judge/PM audit receipt that records `full_outcome_complete: true`.

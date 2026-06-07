import { spawn } from 'node:child_process'

const node = process.execPath

const commands = [
  ['tsc -b', node, ['node_modules/typescript/bin/tsc', '-b']],
  ['vite build', node, ['node_modules/vite/bin/vite.js', 'build']],
  ['eslint .', node, ['node_modules/eslint/bin/eslint.js', '.']],
  ['check:risk-budget', node, ['tools/check-risk-budget.mjs']],
  ['check:static-bundle', node, ['tools/check-static-bundle-markers.mjs']],
  ['check:overlay-runtime', node, ['tools/check-overlay-runtime-boundary.mjs']],
  ['check:runtime-contract', node, ['tools/check-static-runtime-contract.mjs']],
  ['vitest run', node, ['node_modules/vitest/vitest.mjs', 'run']],
  ['smoke:local-runtime', node, ['tools/smoke-local-runtime.mjs']],
  ['smoke:cloud-save-guard', node, ['tools/smoke-cloud-save-guard.mjs']],
  ['smoke:real-spss', node, ['tools/smoke-real-spss-load.mjs']],
  ['smoke:session-stability', node, ['tools/smoke-session-stability.mjs']],
]

function run([label, command, args]) {
  return new Promise((resolve, reject) => {
    console.log(`\n[verify:full] ${label}`)
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      shell: false,
      stdio: 'inherit',
    })
    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${label} exited with code ${code}`))
    })
  })
}

for (const command of commands) {
  await run(command)
}

console.log('\n[verify:full] All checks passed.')

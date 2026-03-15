#!/usr/bin/env node
/**
 * Manual test script: verify CLI basic functionality, no API key required
 * Run: pnpm run test:manual
 */

const { execSync } = require('child_process');
const path = require('path');

const CLI = path.join(__dirname, '../dist/index.js');

function run(cmd, opts = {}) {
  try {
    return execSync(`node ${CLI} ${cmd}`, {
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024,
      stdio: opts.quiet ? 'pipe' : undefined,
      ...opts,
    });
  } catch (e) {
    if (opts.allowFail) {
      return (e.stdout || '') + (e.stderr || '');
    }
    throw e;
  }
}

const tests = [
  { name: '--help', cmd: '--help', expect: 'pdf2markdown' },
  { name: '--version', cmd: '-V', expect: '1.0.0' },
  { name: 'version', cmd: 'version', expect: '1.0.0' },
  { name: 'status command', cmd: 'status', expect: 'pdf2markdown' },
  { name: 'parse --help', cmd: 'parse --help', expect: 'Parse PDF' },
  { name: 'parse-async --help', cmd: 'parse-async --help', expect: 'Parse large' },
  { name: 'login --help', cmd: 'login --help', expect: 'Login' },
  { name: 'setup skills --help', cmd: 'setup skills --help', expect: 'agent' },
  { name: 'logout', cmd: 'logout', expect: 'Logged out' },
  { name: 'parse without input fails', cmd: 'parse', expect: 'Not authenticated', allowFail: true, quiet: true },
];

let pass = 0;
let fail = 0;

console.log('\n--- PDF2Markdown CLI basic tests ---\n');

for (const t of tests) {
  try {
    const out = run(t.cmd, { allowFail: t.allowFail, quiet: t.quiet });
    if (out.includes(t.expect)) {
      console.log(`  ✓ ${t.name}`);
      pass++;
    } else {
      console.log(`  ✗ ${t.name} (output did not contain "${t.expect}")`);
      fail++;
    }
  } catch (e) {
    const msg = (e.stderr || e.stdout || e.message || '') + '';
    if (t.allowFail && msg.includes(t.expect)) {
      console.log(`  ✓ ${t.name}`);
      pass++;
    } else {
      console.log(`  ✗ ${t.name}: ${(e.message || e).toString().split('\n')[0]}`);
      fail++;
    }
  }
}

console.log(`\n--- Result: ${pass} passed, ${fail} failed ---\n`);
process.exit(fail > 0 ? 1 : 0);

#!/usr/bin/env node
/**
 * Performance-budget gate (V3 §5.3 allocation).
 * Milestone 1: validates the budget manifest is present, well-formed, and sums
 * to the 250 KB critical-path ceiling. From Milestone 12 the same script also
 * measures real build output when a `.next` build directory is supplied.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CEILING_KB = 250;
const budgets = JSON.parse(readFileSync(new URL('../budgets.json', import.meta.url), 'utf8'));

const total = Object.values(budgets.criticalPathKb).reduce((a, b) => a + b, 0);
if (total > CEILING_KB) {
  console.error(`Budget manifest exceeds ceiling: ${total} KB > ${CEILING_KB} KB`);
  process.exit(1);
}
console.log(`Budget manifest OK: ${total} KB allocated of ${CEILING_KB} KB ceiling.`);

const buildDir = process.argv[2];
if (buildDir && existsSync(buildDir)) {
  let bytes = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      const s = statSync(p);
      if (s.isDirectory()) walk(p);
      else if (/\.(js|css)$/.test(entry)) bytes += s.size;
    }
  };
  walk(buildDir);
  const kb = Math.round(bytes / 1024);
  console.log(`Measured JS+CSS in ${buildDir}: ${kb} KB (informational until Milestone 12 gate).`);
}

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('production inline publisher validates candidate execution and real cache evidence before any channel mutation', () => {
  const result = spawnSync('python3', ['-I', 'tests/publish_rewardguard_test.py'], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

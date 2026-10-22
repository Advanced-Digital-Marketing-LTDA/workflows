import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readWorkflow = () =>
  readFileSync(
    new URL("../.github/workflows/rewardguard.yml", import.meta.url),
    "utf8",
  );

// The text of one job, from its key to the next top-level job (or the end of the file).
const job = (workflow, name) => {
  const start = workflow.indexOf(`\n  ${name}:\n`);
  assert.notEqual(start, -1, `job ${name} not found`);
  const rest = workflow.slice(start + 1);
  const next = rest.slice(1).search(/\n {2}[a-z][\w-]*:\n/u);
  return next === -1 ? rest : rest.slice(0, next + 1);
};

test("is a reusable workflow that needs both secrets and defaults to no test runs", () => {
  const workflow = readWorkflow();
  assert.match(workflow, /on:\n\s+workflow_call:/u);
  assert.match(workflow, /run-tests:[\s\S]*?type: boolean\n\s+default: false/u);
  assert.match(workflow, /TYPESAFE_API_KEY:\n\s+required: true/u);
  assert.match(workflow, /CLAUDE_CODE_OAUTH_TOKEN:\n\s+required: true/u);
  assert.doesNotMatch(workflow, /pull_request_target|secrets: inherit/u);
});

test("pins every action to a full commit SHA", () => {
  const workflow = readWorkflow();
  const uses = [...workflow.matchAll(/uses: (\S+)/gu)].map((m) => m[1]);
  assert.ok(uses.length >= 6);
  for (const ref of uses) {
    assert.match(ref, /@[a-f0-9]{40}$/u, `${ref} is not pinned to a SHA`);
  }
});

test("runs branch tests only in a job without secrets or saved credentials", () => {
  const tests = job(readWorkflow(), "rewardguard-tests");
  assert.match(tests, /if: \$\{\{ inputs\.run-tests \}\}/u);
  assert.match(tests, /permissions:\n\s+contents: read\n\s+steps:/u);
  assert.match(tests, /persist-credentials: false/u);
  assert.match(tests, /ref: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/u);
  assert.match(tests, /mode: tests/u);
  assert.doesNotMatch(tests, /secrets\.|: write/u);
});

test("judges in a job that holds the secrets and still reports when tests fail or are skipped", () => {
  const check = job(readWorkflow(), "rewardguard");
  assert.match(check, /needs: rewardguard-tests/u);
  assert.match(check, /if: \$\{\{ !cancelled\(\) \}\}/u);
  assert.match(check, /pull-requests: write/u);
  assert.match(check, /ref: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/u);
  assert.match(check, /mode: check/u);
  assert.match(
    check,
    /tests: \$\{\{ inputs\.run-tests && 'true' \|\| 'false' \}\}/u,
  );
  assert.match(
    check,
    /typesafe-api-key: \$\{\{ secrets\.TYPESAFE_API_KEY \}\}/u,
  );
  assert.match(
    check,
    /claude-code-oauth-token: \$\{\{ secrets\.CLAUDE_CODE_OAUTH_TOKEN \}\}/u,
  );
});

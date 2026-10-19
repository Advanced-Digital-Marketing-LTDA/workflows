import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readWorkflow = () =>
  readFileSync(
    new URL("../.github/workflows/codecov.yml", import.meta.url),
    "utf8",
  );

test("accepts coverage artifacts through workflow_call without running caller tests", () => {
  const workflow = readWorkflow();
  assert.match(workflow, /workflow_call:/u);
  assert.match(workflow, /artifact-name:[\s\S]*?default: coverage/u);
  assert.match(
    workflow,
    /coverage-file:[\s\S]*?default: coverage\/lcov\.info/u,
  );
  assert.match(workflow, /CODECOV_TOKEN:\n\s+required: true/u);
  assert.match(workflow, /actions\/download-artifact@[a-f0-9]{40}/u);
  assert.match(workflow, /name: \$\{\{ inputs\.artifact-name \}\}/u);
  assert.match(workflow, /path: coverage/u);
  assert.doesNotMatch(workflow, /npm |vitest|make test/u);
});

test("uploads the caller report and identity, and reports upload failures", () => {
  const workflow = readWorkflow();
  assert.match(workflow, /codecov\/codecov-action@[a-f0-9]{40}/u);
  assert.match(workflow, /files: \$\{\{ inputs\.coverage-file \}\}/u);
  assert.match(workflow, /slug: \$\{\{ github\.repository \}\}/u);
  assert.match(workflow, /token: \$\{\{ secrets\.CODECOV_TOKEN \}\}/u);
  assert.match(workflow, /disable_search: true/u);
  assert.match(workflow, /fail_ci_if_error: true/u);
});

test("checks out caller git metadata without an action post-job hook", () => {
  const workflow = readWorkflow();
  assert.doesNotMatch(workflow, /actions\/checkout@[a-f0-9]{40}/u);
  assert.match(workflow, /GITHUB_TOKEN: \$\{\{ github\.token \}\}/u);
  assert.match(workflow, /git -C "\$GITHUB_WORKSPACE" init/u);
  assert.match(
    workflow,
    /remote add origin \\\s+"https:\/\/github\.com\/\$\{GITHUB_REPOSITORY\}\.git"/u,
  );
  assert.match(workflow, /http\.extraheader=AUTHORIZATION: basic \$authorization/u);
  assert.match(workflow, /fetch --no-tags --depth=1 origin "\$GITHUB_REF"/u);
  assert.match(workflow, /checkout --detach FETCH_HEAD/u);
});

test("keeps fork PRs out of the secret-backed job and permissions read-only", () => {
  const workflow = readWorkflow();
  assert.match(
    workflow,
    /if: \$\{\{ github\.event_name != 'pull_request' \|\| github\.event\.pull_request\.head\.repo\.full_name == github\.repository \}\}/u,
  );
  assert.match(workflow, /permissions:\n\s+contents: read/u);
  assert.doesNotMatch(
    workflow,
    /pull_request_target|secrets: inherit|: write/u,
  );
});

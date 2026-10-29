import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
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

test("turns off setup-node's automatic package-manager cache in both jobs", () => {
  const workflow = readWorkflow();
  for (const name of ["rewardguard-tests", "rewardguard"]) {
    assert.match(job(workflow, name), /package-manager-cache: false/u);
  }
});

test("runs branch tests only in a job without secrets or saved credentials", () => {
  const tests = job(readWorkflow(), "rewardguard-tests");
  assert.match(tests, /if: \$\{\{ inputs\.run-tests \}\}/u);
  assert.match(tests, /permissions:\n\s+contents: read\n\s+steps:/u);
  assert.match(tests, /persist-credentials: false/u);
  assert.match(tests, /needs: rewardguard-base/u);
  assert.match(tests, /ref: \$\{\{ needs\.rewardguard-base\.outputs\.head \}\}/u);
  assert.match(tests, /base: \$\{\{ needs\.rewardguard-base\.outputs\.base \}\}/u);
  assert.match(tests, /mode: tests/u);
  assert.doesNotMatch(tests, /secrets\.|: write/u);
});

test("judges in a job that holds the secrets and still reports when tests fail or are skipped", () => {
  const check = job(readWorkflow(), "rewardguard");
  assert.match(check, /needs: \[rewardguard-base, rewardguard-tests\]/u);
  assert.match(check, /!cancelled\(\)/u);
  assert.doesNotMatch(check, /permissions:/u);
  assert.match(check, /ref: \$\{\{ needs\.rewardguard-base\.outputs\.head \}\}/u);
  assert.match(check, /persist-credentials: false/u);
  assert.match(check, /base: \$\{\{ needs\.rewardguard-base\.outputs\.base \}\}/u);
  assert.match(check, /comment: \$\{\{ github\.event_name == 'pull_request' \}\}/u);
  assert.match(check, /if \[ -z "\$REVIEW_BASE" \] \|\| \[ -z "\$REVIEW_HEAD" \]/u);
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

test("resolves event commits before branch code runs, without secrets or saved credentials", () => {
  const baseline = job(readWorkflow(), "rewardguard-base");
  assert.match(baseline, /permissions:\n\s+contents: read\n/u);
  assert.match(baseline, /persist-credentials: false/u);
  assert.match(baseline, /ref: \$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}/u);
  assert.match(baseline, /BASE_INPUT: \$\{\{ github\.event\.pull_request\.base\.sha \|\| github\.event\.before \}\}/u);
  assert.match(baseline, /base: \$\{\{ steps\.resolve\.outputs\.ref \}\}/u);
  assert.match(baseline, /head: \$\{\{ steps\.resolve\.outputs\.head \}\}/u);
  assert.doesNotMatch(baseline, /secrets\.|: write|npm |pip |rewardguard check|run-tests|uses: \./u);
});

const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

const resolveScript = () => {
  const baseline = job(readWorkflow(), "rewardguard-base");
  const lines = baseline.split("\n");
  const start = lines.findIndex((line) => line === "        run: |");
  assert.ok(start >= 0, "baseline resolver script is missing");
  const script = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() && !line.startsWith("          ")) break;
    script.push(line.slice(10));
  }
  return script.join("\n");
};

for (const kind of ["pr", "push", "first-push", "default-parent", "local-ref", "fetch-ref", "invalid-base", "initial-root", "pr-new-target", "force-push", "wrong-head", "unrelated-pr", "rename-delete"]) {
  test(`baseline resolver handles ${kind} against real git history`, () => {
    const temp = mkdtempSync(join(tmpdir(), "rewardguard-workflow-"));
    try {
      const origin = join(temp, "origin.git");
      const repo = join(temp, "repo");
      mkdirSync(origin); mkdirSync(repo);
      git(origin, "init", "--bare", "-q");
      git(repo, "init", "-q", "-b", "main");
      git(repo, "config", "user.name", "Workflow test");
      git(repo, "config", "user.email", "workflow@example.test");
      git(repo, "remote", "add", "origin", origin);
      writeFileSync(join(repo, "file"), "base\n");
      git(repo, "add", "file"); git(repo, "commit", "-qm", "base");
      const base = git(repo, "rev-parse", "HEAD");
      git(repo, "push", "-qu", "origin", "main");
      git(repo, "branch", "local-base");
      git(repo, "checkout", "-qb", "feature");
      writeFileSync(join(repo, "file"), "head\n");
      git(repo, "commit", "-qam", "head");
      let head = git(repo, "rev-parse", "HEAD");
      const env = Object.fromEntries(["BASE_INPUT", "PR_BASE_SHA", "BASE_REF", "PUSH_BEFORE", "EVENT_NAME", "DEFAULT_BRANCH", "EVENT_REF", "EXPECTED_HEAD"].map((key) => [key, ""]));
      if (kind === "pr") Object.assign(env, { EVENT_NAME: "pull_request", PR_BASE_SHA: base });
      if (kind === "push") Object.assign(env, { EVENT_NAME: "push", PUSH_BEFORE: base, DEFAULT_BRANCH: "main", EVENT_REF: "refs/heads/feature" });
      if (["first-push", "default-parent", "initial-root"].includes(kind)) {
        Object.assign(env, { EVENT_NAME: "push", PUSH_BEFORE: "0".repeat(40), DEFAULT_BRANCH: "main", EVENT_REF: kind === "first-push" ? "refs/heads/feature" : "refs/heads/main" });
      }
      if (kind === "default-parent") git(repo, "update-ref", "refs/remotes/origin/main", head);
      if (kind === "local-ref") env.BASE_INPUT = "local-base";
      if (kind === "fetch-ref") {
        git(repo, "branch", "-D", "main");
        git(repo, "update-ref", "-d", "refs/remotes/origin/main");
        env.BASE_INPUT = "refs/heads/main";
      }
      if (kind === "invalid-base") env.BASE_INPUT = "missing-ref";
      if (kind === "initial-root") {
        git(repo, "checkout", "--detach", base); head = base;
      }
      let expectedBase = base;
      if (kind === "pr-new-target") {
        git(repo, "checkout", "main");
        writeFileSync(join(repo, "target-only"), "target work\n");
        git(repo, "add", "target-only"); git(repo, "commit", "-qm", "new target");
        const target = git(repo, "rev-parse", "HEAD");
        git(repo, "checkout", "feature");
        Object.assign(env, { EVENT_NAME: "pull_request", PR_BASE_SHA: target, BASE_INPUT: target });
      }
      if (kind === "force-push") {
        const before = head;
        git(repo, "checkout", "--detach", base);
        writeFileSync(join(repo, "file"), "rebased head\n");
        git(repo, "commit", "-qam", "rebased head");
        head = git(repo, "rev-parse", "HEAD"); expectedBase = before;
        Object.assign(env, { EVENT_NAME: "push", PUSH_BEFORE: before, DEFAULT_BRANCH: "main", EVENT_REF: "refs/heads/feature" });
      }
      if (kind === "wrong-head") env.BASE_INPUT = base;
      if (kind === "unrelated-pr") {
        git(repo, "checkout", "--orphan", "unrelated");
        git(repo, "commit", "-qm", "unrelated root");
        Object.assign(env, { EVENT_NAME: "pull_request", PR_BASE_SHA: base });
        head = git(repo, "rev-parse", "HEAD");
      }
      if (kind === "rename-delete") {
        git(repo, "mv", "file", "renamed"); git(repo, "commit", "-qm", "rename source");
        git(repo, "rm", "renamed"); git(repo, "commit", "-qm", "delete source");
        head = git(repo, "rev-parse", "HEAD");
        Object.assign(env, { EVENT_NAME: "pull_request", PR_BASE_SHA: base });
      }
      const output = join(temp, "outputs");
      writeFileSync(output, "");
      const result = spawnSync("bash", ["-euo", "pipefail", "-c", resolveScript()], { cwd: repo, encoding: "utf8", env: { ...process.env, ...env, EXPECTED_HEAD: kind === "wrong-head" ? base : head, GITHUB_OUTPUT: output } });
      if (["invalid-base", "initial-root", "wrong-head", "unrelated-pr"].includes(kind)) {
        assert.notEqual(result.status, 0);
        assert.match(result.stdout + result.stderr, /::error::/u);
        assert.equal(readFileSync(output, "utf8"), "");
      } else {
        assert.equal(result.status, 0, result.stdout + result.stderr);
        assert.equal(readFileSync(output, "utf8"), `ref=${expectedBase}\nhead=${head}\npolicy=${base}\n`);
      }
    } finally { rmSync(temp, { recursive: true, force: true }); }
  });
}

test("shared judge inherits caller-bounded permissions and transports immutable policy/head", () => {
  const workflow = readWorkflow();
  assert.doesNotMatch(workflow, /^permissions:/mu);
  assert.doesNotMatch(job(workflow, "rewardguard"), /^    permissions:/mu);
  assert.match(job(workflow, "rewardguard-base"), /policy: \$\{\{ steps\.resolve\.outputs\.policy \}\}/u);
  for (const name of ["rewardguard-tests", "rewardguard"]) {
    assert.match(job(workflow, name), /policy-base: \$\{\{ needs\.rewardguard-base\.outputs\.policy \}\}/u);
    assert.match(job(workflow, name), /head: \$\{\{ needs\.rewardguard-base\.outputs\.head \}\}/u);
  }
  assert.match(job(workflow, "rewardguard"), /Upload candidate execution evidence/u);
  assert.match(workflow, /steps\.judge\.outputs\.publication-outcome/u);
});

test("candidate validation is secret-free and receipt state is explicit without locking future acceptance", () => {
  const validation = readFileSync(new URL("../.github/workflows/validate-rewardguard-candidate.yml", import.meta.url), "utf8");
  assert.match(validation, /node --test tests\/\*\.test\.mjs/u);
  assert.doesNotMatch(validation, /secrets\.|: write|pull_request_target/u);
  const receipt = JSON.parse(readFileSync(new URL("../docs/releases/rewardguard-candidate.json", import.meta.url), "utf8"));
  assert.equal(receipt.schema_version, 1);
  assert.ok(["pending", "accepted"].includes(receipt.status));
  if (receipt.status === "pending") assert.equal(typeof receipt.reason, "string");
});

test('execution artifact records actual action outcomes without serializing credentials', () => {
  const check = job(readWorkflow(), 'rewardguard');
  const match = check.match(/python -I - <<'PY'\n([\s\S]*?)\n {10}PY/u);
  assert.ok(match, 'trusted execution recorder missing');
  const script = match[1].split('\n').map((line) => line.slice(10)).join('\n');
  const temp = mkdtempSync(join(tmpdir(), 'rewardguard-execution-'));
  try {
    const result = spawnSync('python3', ['-I', '-c', script], { encoding: 'utf8', env: {
      ...process.env, RUNNER_TEMP: temp, REPORT_ID: '42', REPORT_DIGEST: 'a'.repeat(64),
      PUBLICATION: 'failure', REVIEW_UPLOAD: 'success', JUDGE_EXIT: '1',
      TYPESAFE_API_KEY: 'must-never-be-recorded', GH_TOKEN: 'must-never-be-recorded',
    } });
    assert.equal(result.status, 0, result.stderr);
    const output = readFileSync(join(temp, 'rewardguard-execution.json'), 'utf8');
    const evidence = JSON.parse(output);
    assert.equal(evidence.PUBLICATION, 'failure');
    assert.equal(evidence.REVIEW_UPLOAD, 'success');
    assert.equal(evidence.JUDGE_EXIT, '1');
    assert.doesNotMatch(output, /must-never-be-recorded|TYPESAFE_API_KEY|GH_TOKEN/u);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test('default pushes remain covered while feature pushes do not duplicate PR reviews', () => {
  const workflow = readWorkflow();
  for (const name of ['rewardguard-base', 'rewardguard']) {
    assert.match(job(workflow, name), /github\.event_name != 'push' \|\| github\.ref == format\('refs\/heads\/\{0\}', github\.event\.repository\.default_branch\)/u);
  }
  assert.match(workflow, /group: rewardguard-shared-.*github\.event\.pull_request\.number \|\| github\.ref/u);
  const caller = readFileSync(new URL('../.github/workflows/rewardguard-check.yml', import.meta.url), 'utf8');
  assert.match(caller, /push:\n\s+branches: \[main\]/u);
  assert.match(caller, /types: \[opened, synchronize, reopened, edited, ready_for_review\]/u);
});

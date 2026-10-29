# Rewardguard rollout rules for ADM repositories

How to add [rewardguard](https://github.com/Advanced-Digital-Marketing-LTDA/reward-hacking-checker) to a
repository, keep it working, and update it. Rewardguard checks for test gaming, including deleted or
skipped tests, weakened assertions, hard-coded answers and swallowed errors. The expanded check also
reviews eligible content changes on pull requests and pushes. This repository hosts the shared workflow,
[`.github/workflows/rewardguard.yml`](../.github/workflows/rewardguard.yml). Every repository calls that
one file through the maintained `v0` branch, so a reviewed shared upgrade reaches every opted-in caller.

**Release channel:** callers use `workflows/.github/workflows/rewardguard.yml@v0`. Inside that workflow,
both RewardGuard action uses are pinned to the full SHA of one published stable `v0.x.y` release,
with its version in a comment. Dependabot opens one grouped upgrade PR in this repository. After
review and merge, exact-main secret-free candidate validation and source-reviewed real-consumer
execution/cache proof are required before `v0` promotion. Old-channel review CI alone is insufficient. No caller pin PRs
are needed for later v0 releases. The first migration still requires one caller PR per repository.

## Content review

Content review runs as part of the same action's `check` mode and the same reusable workflow. It does
not need a second provider-bearing job or a separate ContentGuard caller.

1. **Declare publications.** Trusted-base `[[content.publications]]` maps actual public sources, artifact types and local routes. The default empty list grades no content. Arbitrary Markdown or JavaScript strings are not public solely because they match a path.
2. **Extract reader units.** Deterministic static extraction selects supported public text, JSON fields, metadata and declared dependencies. No whole-source fallback or probabilistic content-task gate is used.
3. **Judge independently.** Website-supported unit/rule propositions use their required evidence. Below 0.60 is ignored; at least 0.60 and below 0.80 warns; at least 0.80 fails. The catalog retains 243 signatures; nonwebsite packs remain outside this initial runtime scope.
4. **Reuse completed records.** Authenticated final records retain clean/warning/failure probabilities, coverage, findings and explanations. Unchanged semantic units use cache-only lookup; a miss is explicitly unchanged without new grading. Changed explanation inputs retain Jev grades and show the explanation gap.

Only explicitly bound trusted-base evidence and declared dependencies are supplied. No automatic document/skill/import/history discovery fills evidence gaps. Static source cannot prove runtime rendering, live routes or external measurements. Missing adopted policy is locally not applicable; other required missing evidence is not evaluated. See [RewardGuard publication configuration](https://github.com/Advanced-Digital-Marketing-LTDA/RewardGuard/blob/c5f97a26b37f7b5cb30af24fe44ab53e45801d82/docs/shared-ci-public-content.md).

Checks follow the actual artifact and available evidence. A short wording edit does not require a
full-site audit or every marketing tactic. If a necessary source, current policy, inventory or render
is unavailable, the affected check is reported as `not_evaluated` with a coverage reason. That is
neither a content defect nor a claimed pass. A provider failure or malformed required model response
remains an execution error and fails closed.

The probability thresholds are fixed at **0.60 for warnings and 0.80 for failures**. Do not add
`[thresholds]` or `[explainer] min_probability` to `.rewardguard.toml`; those settings are rejected.
Improve trusted context or a scoped rule when real findings expose a problem.

Pull requests compare the full target/head merge-base interval. Pushes retain the explicit before-to-head interval, including divergent force pushes; trusted policy comes from the previous default tip or separately resolved default snapshot. Configuration and review instructions come from the trusted
base, not the proposed head. The check report is written to the Actions job summary on both events;
PR comments apply only to pull requests. The judging job does not execute branch code.

Individual GitHub checks make content coverage visible: `contentguard / eligibility` always records classification and skip statistics. Applicable rules with evaluated propositions or evidence gaps receive `contentguard / CG_RULE_ID` checks, aggregated by rule across files and instances with the exact highest defect probability. Unrelated rules are omitted. Warnings at **0.60 ≤ p < 0.80** are neutral; **p ≥ 0.80** fails. Below 0.60 succeeds only for evaluated scopes without gaps. Evidence gaps and skipped scopes are explicitly unverified. Content evaluation errors fail a content check; coding errors remain in the aggregate result.

Every reusable-workflow caller grants `checks: write`, `contents: read` and `pull-requests: write`. The shared judge inherits that caller-bounded set; it does not declare a restrictive permissions map or elevate scopes. Base/test jobs explicitly retain `contents: read`. Callers enabling tests also grant `actions: read` for authenticated same-run artifact transport. Existing no-tests callers keep their three scopes. A missing permission or failed publication fails the aggregate visibly. Keep **`rewardguard / rewardguard`** as the required check: individual rule checks vary with applicability. The Action input `content-checks` defaults to `"true"`; standalone integrations can explicitly disable publication if they cannot grant the permission. The shared organization workflow enables it.

## Rule 1 — Which repositories

- **Rewardguard is for repositories where AI agents change code or content.** Callers choose which pull
  requests and pushes trigger it.
- **JavaScript/TypeScript projects get the intended test-integrity coverage.** The static checks and the
  code-focused Jev questions are built for Jest, Vitest and Playwright projects.
- **Other languages get limited code coverage.**
  - The static rules match JS/TS test patterns, so they will rarely fire.
  - Jev only judges files matched by `[paths] judge_include`. The default list is JS/TS only, so add your
    language's extensions there. Content eligibility and artifact-specific review are separate from
    these code-judge path settings.
- **Skip archived repositories, and the `.github` profile repository.**

## Rule 2 — Organization secrets (once, by an org owner)

Create these as **organization** secrets, available to the selected repositories that use rewardguard:

| Secret | Value |
|---|---|
| `TYPESAFE_API_KEY` | TypeSafe API key for Jev |
| `CLAUDE_CODE_OAUTH_TOKEN` | Output of `claude setup-token` (a one-year token for a Claude subscription) |

- **Never commit a key.** Never pass secrets with `secrets: inherit`.
- **The Claude token bills one person's subscription.** Every repository's checks count against that
  subscription's rate limits.
- **Don't add `ANTHROPIC_API_KEY` for this.** Rewardguard strips it so that it can't silently bill the API.
- **Rotate the Claude token before it expires.** It lasts one year. Re-run `claude setup-token` and update
  the org secret.

## Rule 3 — Files each repository needs

Add all three in **one pull request**. Rewardguard reads `.rewardguard.toml` from the trusted base, so on
this first PR the check fails with "`.rewardguard.toml` not found on the base commit". That is expected: an
org owner merges this one PR past the check.

**`.rewardguard.toml`** at the repository root:

```toml
# Read from the trusted base: proposed config edits cannot change their own review.
run_tests = false            # true only if the test suite can run in a workflow (Rule 5)

[judge]
model = "jev-1.13.0"         # pin a version; jev-latest is rejected

[explainer]
model = "claude-haiku-5-5"
effort = "low"
```

**`.github/workflows/rewardguard.yml`**, which calls the shared workflow:

```yaml
name: rewardguard

on:
  pull_request:
    types: [opened, synchronize, reopened, edited, ready_for_review]
  push:
    branches: [main] # Replace with the repository's actual default branch.

concurrency:
  group: rewardguard-caller-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  rewardguard:
    uses: Advanced-Digital-Marketing-LTDA/workflows/.github/workflows/rewardguard.yml@v0
    permissions:
      contents: read
      pull-requests: write
      checks: write
    with:
      run-tests: false # must match run_tests in .rewardguard.toml
    secrets:
      TYPESAFE_API_KEY: ${{ secrets.TYPESAFE_API_KEY }}
      CLAUDE_CODE_OAUTH_TOKEN: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
```

- `v0` is a maintained branch in this repository, not GitHub's Latest release label. Do not create
  a `v0` tag: tags take precedence over branches when GitHub resolves `uses:`.
- This caller covers PR updates and default-branch pushes. Feature pushes are covered by PR events, avoiding duplicate reviews. The shared workflow also skips feature-push invocations from older callers; migrate their event declarations and retain default-branch push coverage. PR/ref concurrency cancels superseded work and the Action checks PR freshness before providers and publication.
- **Trust boundary:** `@v0` intentionally allows reviewed central upgrades to change what runs with
  caller secrets. Restrict writes to this repository and the `v0` branch to trusted maintainers and
  the promotion automation. The RewardGuard action and other dependencies remain pinned by full SHA.
  Repositories needing independent version approval may keep an immutable shared-workflow SHA instead.
- **Format the file with the repository's own formatter before committing**, for example
  `npx prettier --write`. A repository whose CI runs a format check fails on unformatted workflows.

**`.github/CODEOWNERS`** asks the owner to review CI and rewardguard config changes (it requests the review;
it doesn't block merging, see Rule 4):

```
/.github/          @Bonobo791
/.rewardguard.toml @Bonobo791
```

**Agent rules.** If the repository has an `AGENTS.md` (or similar) that limits which workflows may use
provider credentials, add `.github/workflows/rewardguard.yml` to the list it allows. Say that it calls:
- Anthropic, with `CLAUDE_CODE_OAUTH_TOKEN`
- the TypeSafe Jev API, with `TYPESAFE_API_KEY`

Without this, review bots and agents will keep flagging the workflow.

## Rule 4 — Branch protection on the default branch

After the setup PR is merged, add a branch ruleset (Settings → Rules → Rulesets) on the default branch with:

1. **Require a pull request before merging.** Leave **Require review from Code Owners** off, and required
   approvals at 0: nobody can approve their own PR, and agents open PRs under the owner's account, so with one
   owner those PRs could never merge.
2. **Require status checks to pass**, adding the check named **`rewardguard / rewardguard`**. That is the
   caller's job name, then the shared workflow's job name.
3. **No bypass for agents or bots.** Org owners bypass only for the first setup PR (Rule 3).

Add the required check **after** merging the setup PR, not before. Otherwise the setup PR blocks itself.

## Rule 5 — Test runs

- **Default: off** (`run_tests = false` and `run-tests: false`). Rewardguard then runs the static checks,
  code judging and applicable content review without executing the repository's tests.
- **Turn them on only when the whole suite runs on a GitHub-hosted runner in reasonable time.** Set
  `run_tests = true`, add `install` and `[[suites]]` to `.rewardguard.toml` (see the
  [checker's example](https://github.com/Advanced-Digital-Marketing-LTDA/reward-hacking-checker/blob/main/examples/.rewardguard.toml)),
  and set `run-tests: true` in the caller.
- **The two settings must agree.** If the config says `true` but the caller says `false`, the check fails
  rather than running tests next to the secrets.
- **Branch tests run in a separate job with no secrets.** Never move them into the judging job. Add `actions: read` to the caller when enabling tests; no-tests callers do not need it.
- Test results authenticate repository, run/attempt, archive digest and immutable base/head/policy. Provenance does not prove test honesty/effectiveness. Local `--run-results` remains supported; credential CI uses authenticated `--test-artifact`.
- CI uses `--require-complete`: incomplete required evidence returns exit 3, distinct from failure findings (1) and execution errors (2). Local CLI retains legacy exit 0 for incomplete evidence without other failures/errors; its report still says incomplete. Incomplete scoped checks never advertise success.

## Rule 6 — Updating RewardGuard

**One-time Dependabot setup:** in this repository's Settings → Secrets and variables → Dependabot,
add `TYPESAFE_API_KEY` and `CLAUDE_CODE_OAUTH_TOKEN` with the same provider credentials used by
Actions (or grant this repository access to equivalent organization Dependabot secrets). Actions
secrets are not available to Dependabot-triggered runs. The caller already explicitly grants
`pull-requests: write` and `checks: write`; keep those permissions. Without the two Dependabot
secrets, required review CI fails and the upgrade must remain unmerged. Re-running the bot's
workflow does not change its secret access. See
[GitHub's Dependabot Actions guidance](https://docs.github.com/en/code-security/reference/supply-chain-security/troubleshoot-dependabot/dependabot-on-actions).

**One-time channel protection (repository owner):** apply the supplied exact-ref rulesets
before merging caller migrations. The branch rules forbid force pushes and deletion and require
independent PR approval and the required GitHub Actions checks on commits promoted to `v0`. The tag rules
prevent anyone from creating a shadowing `v0` tag. No bypass actors are configured.

```sh
gh api --method POST repos/Advanced-Digital-Marketing-LTDA/workflows/rulesets --input docs/releases/v0-branch-rules.json
gh api --method POST repos/Advanced-Digital-Marketing-LTDA/workflows/rulesets --input docs/releases/v0-tag-rules.json
```

These commands require an owner token with repository Administration write permission. The connected
integration returned HTTP 403 when applying the branch rules and listing Dependabot secrets. The
rules and credentials are not claimed configured. Inspect the repository Rules settings and
Dependabot secret access before rollout; repository admin status alone does not grant an app those
API scopes. Automatic direct promotion is disabled until a dedicated promotion identity and its restrictions are configured and verified; do not remove the PR rule to enable it.

The new source pins the tested local engine candidate `c5f97a26b37f7b5cb30af24fe44ab53e45801d82` with intended version `v0.3.0`. It is **pending publication**; no matching remote tag/release/CI is claimed. Promotion rejects an unpublished action. Both action uses must always match.

1. Publish and test the real stable action release under separate authorization; verify tag resolution and exact-SHA `ci.yml` success. Review the exact shared workflow and publisher/policy source as immutable candidate C.
2. Secret-free `Validate RewardGuard candidate` CI exercises contracts, real-Git resolver fixtures and the actual inline publisher with fake GitHub responses. It never receives provider secrets. The required check is `RewardGuard candidate validation` from GitHub Actions; apply the updated exact v0 rules payload with owner review before promotion.
3. A separately reviewed trusted consumer caller invokes literal `.../rewardguard.yml@C`, using deployed trusted-base public mappings, matching test settings and bounded permissions. It performs genuine first and restored-record replay runs. Proposed workflow/action code is never run beside provider credentials.
4. Commit reviewed receipt P only after real run/report provenance and clean/warning/failure/explanation reuse have been inspected. The publisher verifies C is an ancestor and shared workflow, publisher, validator, test and protection-policy bytes are identical; it requires exact-P validation plus old-channel review CI. See [candidate evidence contract](rewardguard-candidate-validation.md).
5. The publisher independently authenticates exact consumer run attempts, default-branch head, C runtime metadata, execution/report artifact digests and actual action revision. Expected finding failures remain failed; execution, upload or publication errors block. Initial cache miss plus genuine replay without content regrading/re-explanation is mandatory. A pending/absent receipt blocks publication.
6. Automatic direct promotion is disabled. Use a separately reviewed PR under the protected v0 rules, and inspect a subsequent real consumer's resolved workflow/action revisions and behavior. Engine merge, channel publication and consumer acceptance are separate.

The publisher job is disabled, including for `workflow_dispatch`. Re-enabling it requires a dedicated promotion identity and verified restriction of v0 updates to that identity. Both exact-main runs and real proof must already exist. No checkout, branch scripts, provider credentials or model calls run in the publisher; bounded artifacts are parsed as data only. The token must read the chosen consumer's Actions proof; unavailable private-repository access blocks promotion rather than introducing fallback credentials.

Forward rollback needs a separately reviewed later main commit restoring the **complete** known-good reusable workflow and compatible publisher policy. Restoring only v0.2.3 action pins in the new wrapper is incompatible with its new inputs/artifact contract. Revalidate baseline protections, CI and actual runtime under that reviewed policy, then promote the later commit with a fast-forward. There is no automatic rollback mode or bypass, and no force/reset of v0. Verified source baseline: shared `98644db90cb691013e4a93d1539dc3de5c01e1d4`, published v0.2.3 action `958ef58b886910c5370536c63252a0a81f30fe8d`; these source references do not themselves prove old runtime behavior or a completed rollback drill.

Actions cache is interim and may miss or be evicted. Durable storage and concurrent exactly-once coordination remain REWARD-1. Budget changes are outside this rollout.

**Scope:** this channel updates CI callers only. Local pipx installations, Codex hook executables,
and optional pre-commit `rev:` pins are separate installations and do not auto-upgrade.

Never edit a repository's caller to use the RewardGuard action directly. All opted-in repositories go
through this shared workflow, so there is one place to update.

## Rule 7 — CI and config changes

The code-integrity exclusions for `.github/` and `.rewardguard.toml` allow legitimate CI/config changes.
Content review does not replace review of credential access, workflow execution or guard configuration.

- **Config edits can't loosen their own review.** Configuration and rule context are read from the
  trusted base. Proposed edits apply only when a later review uses them as trusted base context.
- **Review CI changes yourself before merging.** Removing a test step or adding `continue-on-error`
  needs human review even when Rewardguard reports no content or code defects.

## Rule 8 — Other behaviour to expect

- **Fork PRs get no secrets, so the check fails.** Never weaken the check for them. A maintainer reviews the
  change, then pushes it to a branch in the repository to run the check.
- **Fail-closed:** a missing key, a Jev or Claude error, or a missing config fails the check. There is no
  fallback.
- **Thresholds are fixed.** Below 0.60 is ignored, 0.60 to below 0.80 warns, and 0.80 or higher fails.
  Configuration cannot change them: `[thresholds]` is rejected. Review scoped rules and trusted context when
  findings need correction; if a rule misfires in a repository, turn it off under `[rules]`
  (`RULE_NAME = "off"`) with a PR, which the owner reviews.

## Rule 9 — Checklist for a new repository

- [ ] The repository is eligible (Rule 1), and the org secrets are shared with it (Rule 2).
- [ ] One PR adds `.rewardguard.toml`, the caller workflow, CODEOWNERS lines and any `AGENTS.md` approval,
      formatted with the repository's formatter (Rule 3).
- [ ] On that PR, rewardguard ran and failed only with "`.rewardguard.toml` not found on the base commit".
      Any other error means the setup is wrong.
- [ ] An org owner merged it past the check once, then added the branch ruleset requiring
      `rewardguard / rewardguard` (Rule 4).
- [ ] The checker action, shared workflow and caller pins contain the intended published feature revisions
      (Rule 6); the caller has the desired pull-request and push triggers.
- [ ] Later ordinary pull-request and push runs show Rewardguard passing, reporting real findings or
      explicitly recording applicable content skips/coverage gaps.

## Optional — Enforce it org-wide without per-repo callers

GitHub organization rulesets can **require a workflow** from a central repository on every PR in selected
repositories. A PR then can't edit the check at all. This depends on the org's GitHub plan, and has limits
reported in community threads:
- it covers only `pull_request` / `merge_group` events
- a repository may need at least one local workflow for the required workflow to run

Verify it in the org's Settings → Rules before relying on it. Until then, use the per-repository caller
above.

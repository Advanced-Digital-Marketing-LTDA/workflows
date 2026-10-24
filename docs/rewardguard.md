# Rewardguard rollout rules for ADM repositories

How to add [rewardguard](https://github.com/Advanced-Digital-Marketing-LTDA/reward-hacking-checker) to a
repository, keep it working, and update it. Rewardguard checks for test gaming, including deleted or
skipped tests, weakened assertions, hard-coded answers and swallowed errors. The expanded check also
reviews eligible content changes on pull requests and pushes. This repository hosts the shared workflow,
[`.github/workflows/rewardguard.yml`](../.github/workflows/rewardguard.yml). Every repository calls that
one file, so a fix or upgrade is made once and rolled out by bumping a pinned commit.

**Publication and pinning:** the expanded behavior must first be published in the RewardGuard action.
Then the shared workflow must pin that action revision, and callers must pin the corresponding
published shared-workflow revision. Existing pins keep their existing behavior. The examples below
show the caller setup for that rollout; they do not establish that publication or caller updates have
been completed. See Rule 6 for the update order.

## Content review

Content review runs as part of the same action's `check` mode and the same reusable workflow. It does
not need a second provider-bearing job or a separate ContentGuard caller.

1. **Detect content first.** A deterministic gate identifies eligible changes such as prose, UI copy,
   page metadata, structured data and publication controls. Changes with no content skip the content
   phase without content-model calls; the existing code-integrity checks still apply.
2. **Classify the task.** Jev decides whether an eligible change is a content task. A probability below
   0.60 skips content checks. A probability of **0.60 or higher** selects applicable checks; the
   classification itself is not a warning or failure.
3. **Judge defects independently.** Each applicable claim, field or requirement receives its own
   judgment. A defect probability below 0.60 is ignored, at least 0.60 and below 0.80 warns, and at
   least 0.80 fails. A broad pack does not receive one aggregate quality score.
4. **Explain with focused context.** Claude Haiku receives the corresponding focused rule/skill,
   changed evidence and necessary trusted context. Product, brand and editorial instructions come
   from the trusted base or explicit user instructions. Proposed content cannot change the rules for
   its own review.

Checks follow the actual artifact and available evidence. A short wording edit does not require a
full-site audit or every marketing tactic. If a necessary source, current policy, inventory or render
is unavailable, the affected check is reported as `not_evaluated` with a coverage reason. That is
neither a content defect nor a claimed pass. A provider failure or malformed required model response
remains an execution error and fails closed.

The probability thresholds are fixed at **0.60 for warnings and 0.80 for failures**. Do not add
`[thresholds]` or `[explainer] min_probability` to `.rewardguard.toml`; those settings are rejected.
Improve trusted context or a scoped rule when real findings expose a problem.

Pull requests compare their proposed changes with a resolved trusted base; pushes compare the pushed
head with the action's resolved push base. Configuration and review instructions come from the trusted
base, not the proposed head. The check report is written to the Actions job summary on both events;
PR comments apply only to pull requests. The judging job does not execute branch code.

Individual GitHub checks make content coverage visible: `contentguard / eligibility` always records classification and skip statistics. Applicable rules with evaluated propositions or evidence gaps receive `contentguard / CG_RULE_ID` checks, aggregated by rule across files and instances with the exact highest defect probability. Unrelated rules are omitted. Warnings at **0.60 ≤ p < 0.80** are neutral; **p ≥ 0.80** fails. Below 0.60 succeeds only for evaluated scopes without gaps. Evidence gaps and skipped scopes are explicitly unverified. Content evaluation errors fail a content check; coding errors remain in the aggregate result.

The judge job **and every reusable-workflow caller** require `checks: write`, in addition to `contents: read` and `pull-requests: write`. The shared workflow grants this only to the judge job; branch test jobs retain read-only permissions. A missing permission or failed publication fails the aggregate visibly. Keep **`rewardguard / rewardguard`** as the required check: individual rule checks vary with applicability. The Action input `content-checks` defaults to `"true"`; standalone integrations can explicitly disable publication if they cannot grant the permission. The shared organization workflow enables it.

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
  push:

jobs:
  rewardguard:
    uses: Advanced-Digital-Marketing-LTDA/workflows/.github/workflows/rewardguard.yml@<workflows-commit-sha>
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

- Replace `<workflows-commit-sha>` with the full commit SHA of this repository's `main` that contains the
  version you want and pins a RewardGuard action revision with the required feature. The placeholder is
  not a usable revision.
- The caller selects events. This example runs on both pull requests and pushes; apply branch filters
  if the repository's policy limits which pushes should be reviewed.
- **Never use `@main` or a tag.** Anyone who can move them could change what runs with your secrets.
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
- **Branch tests run in a separate job with no secrets.** Never move them into the judging job.

## Rule 6 — Updating rewardguard

Change rewardguard in [`reward-hacking-checker`](https://github.com/Advanced-Digital-Marketing-LTDA/reward-hacking-checker)
first, then roll it out:

1. **Publish the checker action change.** Merge the required implementation into
   `reward-hacking-checker` and identify its published full commit SHA. Content support and push-base
   handling must exist in that action revision before callers can use them.
2. **Update this repository.** Open a PR that sets every shared-workflow
   `reward-hacking-checker@<sha>` pin to that published revision, including the test and check jobs.
   Include the required push/PR workflow handling. Update other action pins if needed, using full SHAs
   with the version in a comment. Complete the repository's required checks, then merge and record the
   resulting published shared-workflow SHA.
3. **Update each repository.** Open a PR that bumps its caller's `workflows/...@<sha>` to that published
   shared-workflow revision and adds the desired `push` trigger alongside `pull_request`. Keep the two
   secrets explicitly named. Merge and inspect the resulting runs before calling that caller rolled out.

A local checkout or documentation update does not publish either revision. New shared-workflow source
with an old checker pin cannot provide the checker feature; a caller pinned to the old shared workflow
also keeps the old behavior. Do not invent a replacement SHA or claim organization rollout without
the actual publication and caller updates.

Never edit a repository's caller to use the reward-hacking-checker action directly. All repositories go
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

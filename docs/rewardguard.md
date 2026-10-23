# Rewardguard rollout rules for ADM repositories

How to add [rewardguard](https://github.com/Advanced-Digital-Marketing-LTDA/reward-hacking-checker) to a
repository, keep it working, and update it. Rewardguard fails a pull request when an AI coding agent
may have gamed its tests: deleted or skipped tests, weakened assertions, hard-coded answers, swallowed
errors, and similar. This repository hosts the shared workflow,
[`.github/workflows/rewardguard.yml`](../.github/workflows/rewardguard.yml). Every repository calls that
one file, so a fix or upgrade is made once and rolled out by bumping a pinned commit.

## Rule 1 — Which repositories

- **Rewardguard is for repositories where AI agents open pull requests.**
- **JavaScript/TypeScript projects get full coverage.** The static checks and the Jev questions are built for
  Jest, Vitest and Playwright projects.
- **Other languages get little coverage.**
  - The static rules match JS/TS test patterns, so they will rarely fire.
  - Jev only judges files matched by `[paths] judge_include`. The default list is JS/TS only, so add your
    language's extensions there.
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

Add all three in **one pull request**. Rewardguard reads `.rewardguard.toml` from the default branch, so on
this first PR the check fails with "`.rewardguard.toml` not found on the base commit". That is expected: an
org owner merges this one PR past the check.

**`.rewardguard.toml`** at the repository root:

```toml
# Read from the default branch: edits in a PR take effect only once it merges.
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

jobs:
  rewardguard:
    uses: Advanced-Digital-Marketing-LTDA/workflows/.github/workflows/rewardguard.yml@<workflows-commit-sha>
    permissions:
      contents: read
      pull-requests: write
    with:
      run-tests: false # must match run_tests in .rewardguard.toml
    secrets:
      TYPESAFE_API_KEY: ${{ secrets.TYPESAFE_API_KEY }}
      CLAUDE_CODE_OAUTH_TOKEN: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
```

- Replace `<workflows-commit-sha>` with the full commit SHA of this repository's `main` that contains the
  version you want.
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

- **Default: off** (`run_tests = false` and `run-tests: false`). Rewardguard then runs the static checks and
  Jev/Haiku only.
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

1. **Update the checker.** Merge the change to `reward-hacking-checker` `main`.
2. **Update this repository.** Open a PR that sets the shared workflow's `reward-hacking-checker@<sha>` pins
   to the new `main` commit. Also update the action pins (`actions/checkout`, `actions/setup-node`) if
   needed, again to full SHAs with the version in a comment. Run `node --test tests/*.test.mjs`, then merge.
3. **Update each repository.** Open a PR that bumps its caller's `workflows/...@<sha>` to the new commit of
   this repository, then merge it.

Never edit a repository's caller to use the reward-hacking-checker action directly. All repositories go
through this shared workflow, so there is one place to update.

## Rule 7 — CI and config changes

Rewardguard doesn't flag changes to `.github/` or `.rewardguard.toml`, because CI sometimes has to change.
- **Config edits can't loosen the PR they're in.** The config is read from the default branch, so a change
  applies from the next PR after it merges.
- **CI edits are not checked by rewardguard.** A PR could remove a test step or add `continue-on-error`
  and still pass. Review CI changes yourself before merging, especially from agents.

## Rule 8 — Other behaviour to expect

- **Fork PRs get no secrets, so the check fails.** Never weaken the check for them. A maintainer reviews the
  change, then pushes it to a branch in the repository to run the check.
- **Fail-closed:** a missing key, a Jev or Claude error, or a missing config fails the check. There is no
  fallback.
- **Severity is fixed in rewardguard:** a Jev probability below 0.60 is not reported, 0.60–0.79 warns and 0.80
  or higher fails. `[thresholds]` is rejected. If a rule misfires in a repository, turn it off under `[rules]`
  (`RULE_NAME = "off"`) with a PR, which the owner reviews.

## Rule 9 — Checklist for a new repository

- [ ] The repository is eligible (Rule 1), and the org secrets are shared with it (Rule 2).
- [ ] One PR adds `.rewardguard.toml`, the caller workflow, CODEOWNERS lines and any `AGENTS.md` approval,
      formatted with the repository's formatter (Rule 3).
- [ ] On that PR, rewardguard ran and failed only with "`.rewardguard.toml` not found on the base commit".
      Any other error means the setup is wrong.
- [ ] An org owner merged it past the check once, then added the branch ruleset requiring
      `rewardguard / rewardguard` (Rule 4).
- [ ] A later ordinary PR shows rewardguard passing or reporting real findings.

## Optional — Enforce it org-wide without per-repo callers

GitHub organization rulesets can **require a workflow** from a central repository on every PR in selected
repositories. A PR then can't edit the check at all. This depends on the org's GitHub plan, and has limits
reported in community threads:
- it covers only `pull_request` / `merge_group` events
- a repository may need at least one local workflow for the required workflow to run

Verify it in the org's Settings → Rules before relying on it. Until then, use the per-repository caller
above.

# RewardGuard v0 release-channel migration

## Selected release model

- ADM callers use `Advanced-Digital-Marketing-LTDA/workflows/.github/workflows/rewardguard.yml@v0`.
- `v0` is a managed branch in the workflows repository. It was initialized at existing shared main `d984472c40b43a6f6ca8b9f8adbda97fdda64b6c`; no `v0` tag exists. Do not create a tag that shadows it.
- Shared action pins use the immutable published v0.2.0 SHA `765e470fb00e349101180160130fb80e9e8b2dfd`.
- Dependabot proposes one grouped release update. Human review and required PR CI precede merging. A successful exact-main RewardGuard push run then permits publication of that main revision to `v0`.
- Promotion validates matching release SHA/version pins and a published stable v0 tag. No checkout, artifacts, provider credentials or model calls are used by the publisher. Updates fast-forward only; stale candidates cannot roll the channel backward.
- SHA-pinned caller repositories keep their current behavior until their migration PR merges. Subsequent v0 releases require no caller pin PRs. Local installs and pre-commit rev pins remain separate.

## Required one-time setup

The workflows repository must receive `TYPESAFE_API_KEY` and `CLAUDE_CODE_OAUTH_TOKEN` through Dependabot secrets as well as its existing Actions secrets. See Settings → Secrets and variables → Dependabot. The existing caller explicitly requests checks/PR write permissions. Missing credentials remain a blocking CI failure; no gate is bypassed. The execution environment does not have these provider credentials, so this setup is not claimed complete.

Channel protections are also pending: GitHub rejected the integration's ruleset creation with HTTP 403. Apply `docs/releases/v0-branch-rules.json` and `docs/releases/v0-tag-rules.json` with repository Administration write permission before merging caller migrations. These restrict force pushes/deletion, require the RewardGuard check, and prevent a tag shadowing the channel branch. The source publisher's fast-forward guard alone does not enforce repository-wide permissions.

## Review and execution status

Python publisher syntax parsed. Independent static review found the Dependabot-secrets prerequisite, now documented. No tests were added or run locally; existing CI evaluates each PR. GitHub's documented permissions behavior was checked: explicit workflow permissions can increase Dependabot's default read-only token. Live publication remains unverified until the central workflow is merged and executes. This is a new protected-main PR set beyond prior approvals; merge permission is pending. Actual test, security, code and content failures remain blocking. Requested channel-reference changes require owner review rather than being treated as immutable pin changes.

## Pull requests

| Repository | PR | Scope |
| --- | --- | --- |
| workflows | [#21](https://github.com/Advanced-Digital-Marketing-LTDA/workflows/pull/21) | Release pin, Dependabot, publisher, docs, own caller |
| RewardGuard | [#23](https://github.com/Advanced-Digital-Marketing-LTDA/RewardGuard/pull/23) | Caller reference only |
| SEO-Research | [#23](https://github.com/Advanced-Digital-Marketing-LTDA/SEO-Research/pull/23) | Caller reference only |
| the-lippincott-team | [#114](https://github.com/Advanced-Digital-Marketing-LTDA/the-lippincott-team/pull/114) | Caller reference only |
| Moderaty | [#275](https://github.com/Advanced-Digital-Marketing-LTDA/Moderaty/pull/275) | Caller reference only |
| Advanced-Digital-Marketing-LTDA | [#37](https://github.com/Advanced-Digital-Marketing-LTDA/Advanced-Digital-Marketing-LTDA/pull/37) | Caller reference only |
| Top-Realtors-Cypress-TX | [#24](https://github.com/Advanced-Digital-Marketing-LTDA/Top-Realtors-Cypress-TX/pull/24) | Caller reference only |
| Site-Bootstrap-ADM | [#9](https://github.com/Advanced-Digital-Marketing-LTDA/Site-Bootstrap-ADM/pull/9) | Caller reference only |
| App-Bootstrap-ADM | [#10](https://github.com/Advanced-Digital-Marketing-LTDA/App-Bootstrap-ADM/pull/10) | Caller reference only |
| Langlo | [#184](https://github.com/Advanced-Digital-Marketing-LTDA/Langlo/pull/184) | Caller reference only |
| AI-Comment-Moderation | [#23](https://github.com/Advanced-Digital-Marketing-LTDA/AI-Comment-Moderation/pull/23) | Caller reference only |
| tina-cms-mcp | [#9](https://github.com/Advanced-Digital-Marketing-LTDA/tina-cms-mcp/pull/9) | Caller reference only |
| coolify-mcp | [#16](https://github.com/Advanced-Digital-Marketing-LTDA/coolify-mcp/pull/16) | Caller reference only |

Merge the shared implementation first after review/CI/approval, inspect successful main promotion, then merge caller migrations under the same conditions. Previously open context-only upgrades in SEO-Research, Site-Bootstrap-ADM, App-Bootstrap-ADM, tina-cms-mcp and coolify-mcp can be closed as superseded after their channel migrations land.

## Initial CI review

Early adversarial-review failures in SEO-Research, Moderaty, the ADM site, Site-Bootstrap and Langlo object to the requested mutable channel. That is an intentional trust-model change requiring owner acceptance; the absence of repository protection is real and remains pending, with exact setup payloads supplied. Do not describe those checks as passing or merge past unrelated actual failures. CI is still running on other PRs.

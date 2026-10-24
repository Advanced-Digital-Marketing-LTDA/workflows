# Content review rollout — 2026-10-24

## Published release

- [RewardGuard #19](https://github.com/Advanced-Digital-Marketing-LTDA/RewardGuard/pull/19) merged at `b8dd2ff6a285b59b3012774a41fc3348a8da6ffe`; implementation revision `3af66b3c257a21c8cd7e47214c8a5caa51d24703` passed existing CI, RewardGuard, SonarCloud, and Semgrep.
- [Shared workflow #15](https://github.com/Advanced-Digital-Marketing-LTDA/workflows/pull/15) merged at `591dc820c0ff16f1264ae54134063812aea41435`. Callers pin its reviewed source revision `c37cb313146cced88398b1a9c051b2098aba4076`, which passed all existing checks.
- Automatic trusted Git evidence, positive subject applicability, input readiness, 87 bounded source alternatives, and individual GitHub checks are implemented across 243 rules / 37 focused packs.
- The owner approved dependency-ordered merges after review and CI. Only the four first-time setups may use the documented missing-base-config exception. Other failures remain blocking.

## Actual content validation

The [Moderaty replay #271](https://github.com/Advanced-Digital-Marketing-LTDA/Moderaty/pull/271) reviewed an actual article change against configured trusted context: **23 evaluated propositions and 3 scoped evidence gaps**, with individual native content checks. Writing, editing, and proof checks were evaluated; remaining media and metadata propositions need current rendered or visual evidence.

[Validation report](https://github.com/Advanced-Digital-Marketing-LTDA/Moderaty/pull/271#issuecomment-6388577639).

Earlier negative applicability routing incorrectly skipped every rule; the published release routes using positive changed subjects instead. Eligible content with no evaluated propositions is explicitly unverified. Source files do not establish runtime, external truth, or visual observations. The replay was closed without merging; its separate coding findings do not change the content evidence result.

## Repository completion PRs

| Repository | PR | Scope |
| --- | --- | --- |
| SEO-Research | [#20](https://github.com/Advanced-Digital-Marketing-LTDA/SEO-Research/pull/20) | Upgrade |
| the-lippincott-team | [#111](https://github.com/Advanced-Digital-Marketing-LTDA/the-lippincott-team/pull/111) | Upgrade and product context |
| Moderaty | [#270](https://github.com/Advanced-Digital-Marketing-LTDA/Moderaty/pull/270), [#272](https://github.com/Advanced-Digital-Marketing-LTDA/Moderaty/pull/272) | Initial upgrade merged; final release follow-up |
| Advanced-Digital-Marketing-LTDA | [#34](https://github.com/Advanced-Digital-Marketing-LTDA/Advanced-Digital-Marketing-LTDA/pull/34) | Upgrade and product context |
| Top-Realtors-Cypress-TX | [#21](https://github.com/Advanced-Digital-Marketing-LTDA/Top-Realtors-Cypress-TX/pull/21) | Upgrade |
| Site-Bootstrap-ADM | [#6](https://github.com/Advanced-Digital-Marketing-LTDA/Site-Bootstrap-ADM/pull/6) | First setup |
| App-Bootstrap-ADM | [#7](https://github.com/Advanced-Digital-Marketing-LTDA/App-Bootstrap-ADM/pull/7) | First setup |
| Langlo | [#178](https://github.com/Advanced-Digital-Marketing-LTDA/Langlo/pull/178) | Upgrade |
| AI-Comment-Moderation | [#20](https://github.com/Advanced-Digital-Marketing-LTDA/AI-Comment-Moderation/pull/20) | Upgrade |
| tina-cms-mcp | [#6](https://github.com/Advanced-Digital-Marketing-LTDA/tina-cms-mcp/pull/6) | First setup |
| coolify-mcp | [#13](https://github.com/Advanced-Digital-Marketing-LTDA/coolify-mcp/pull/13) | First setup and existing scanner repair |
| workflows | [#16](https://github.com/Advanced-Digital-Marketing-LTDA/workflows/pull/16) | Upgrade |
| RewardGuard | [#20](https://github.com/Advanced-Digital-Marketing-LTDA/RewardGuard/pull/20) | Upgrade |

All completion PR callers pin the published release above and grant check publication only to their review job. Twelve rollouts have merged and their default-branch pins, permissions, and enabled content configuration were read back. Coolify's full CI completed and its setup merged. Moderaty's latest unit/browser CI passed; its workflow-owner review exception remains pending.

Coolify's existing OSSAR job failed before scanning because its ESLint configuration did not parse TypeScript. The repair preserves scanner policy and rules, adds a TypeScript parser, and loads security configuration and integrity-locked dependencies from an immutable reviewed commit. It does not suppress scanner findings.

## Operation

Ordinary PR and push events use the trusted base configuration. First setup cannot trust its own newly proposed configuration; subsequent events can use the installed configuration. Existing open branches may need the default branch merged or their caller pin refreshed.

Jev classifies content at p >= 0.60. Eligible rules get individual focused review; defect p >= 0.60 warns and p >= 0.80 fails. Lower probabilities are ignored. Genuine evidence gaps are neutral and are never described as passed review. Non-content changes skip content review while code review continues.

The existing Codex global hook uses the same staged-content gate when its RewardGuard installation is updated. The optional pre-commit hook uses `rewardguard check --staged --content-only`; see [RewardGuard setup](https://github.com/Advanced-Digital-Marketing-LTDA/RewardGuard#optional-pre-commit-content-hook). Local tool installation and credentials belong to each developer environment.

No application tests, agent guidance, secrets, or branch protections were changed by these repo completion updates. Existing provider secrets are working on observed eligible content runs. Required-check enforcement remains each repository's existing protection policy.

## Rollout status at 20:48 UTC

Merged and default-branch configuration verified: SEO-Research, the-lippincott-team, Advanced-Digital-Marketing-LTDA, Top-Realtors-Cypress-TX, Site-Bootstrap-ADM, App-Bootstrap-ADM, Langlo, AI-Comment-Moderation, tina-cms-mcp, coolify-mcp, workflows, and RewardGuard.

- Coolify #13 merged at `acb55774291365edc4aad169566fbaec9d93fddd` after both full application CI runs, mutation and smoke checks, scanner/drift guard, AI review, and external analyses passed. Its sole review error was the approved first-setup missing-base configuration exception. Default-branch content configuration and caller permissions/pin were read back.
- Moderaty #272 remains unmerged at `785103b90a27e035b71c01c4526eb28357f9a900`. Its latest full unit/browser CI passed with application code and assertions unchanged. Prior mobile disclosure failures were intermittent; failure-only Playwright artifact retention now captures evidence if they recur. The sole current gate finding is C4 owner review for the RewardGuard caller pin and diagnostic workflow edit. The verifier has no owner-approval mechanism. The owner was asked for this additional specific exception; the earlier merge approval allowed only bootstrap configuration errors. No gate was weakened.
- Final content replay head `102bbfc790a3039b77305464b09bd8c238c1395e` evaluated 23 propositions with zero content findings and three unverified visual/rendered evidence gaps. Individual check rows were confirmed through the GitHub API. The audit PR is closed, and no application content was merged by that replay.

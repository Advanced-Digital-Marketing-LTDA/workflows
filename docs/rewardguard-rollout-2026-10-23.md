# ADM RewardGuard rollout — 2026-10-23

## Scope and published versions

All 13 repositories returned by the connected ADM repository inventory are active and have rollout PRs. Twelve are new setups; Langlo upgrades an existing setup. No rollout PR has been merged by this work.

- Shared workflow: `90211def07592394c8459328eeceaacc01729b10`.
- RewardGuard action pinned by that workflow: `13c9fb2e83aa86809cf73c70ea593fa2dd493a64`.
- Prerequisites merged: [RewardGuard #17](https://github.com/Advanced-Digital-Marketing-LTDA/RewardGuard/pull/17) and [workflows #12](https://github.com/Advanced-Digital-Marketing-LTDA/workflows/pull/12).
- Events: pushes and pull requests. Review covers Git changes, including eligible content; unchanged repository files are not scanned.
- Existing application test workflows and agent guidance are unchanged. RewardGuard's optional extra test job remains disabled, matching the existing rollout default.

## PR index and initial CI snapshot

These observations are a snapshot, not live status or evidence of organization-wide activation. Run links refer to the initial rollout commits. Queued jobs remain unverified.

| Repository | Rollout PR | Change | Observed RewardGuard CI |
| --- | --- | --- | --- |
| SEO-Research | [#17](https://github.com/Advanced-Digital-Marketing-LTDA/SEO-Research/pull/17) | New setup | [Expected trusted-base config error confirmed in PR job log](https://github.com/Advanced-Digital-Marketing-LTDA/SEO-Research/actions/runs/40011366335) |
| the-lippincott-team | [#110](https://github.com/Advanced-Digital-Marketing-LTDA/the-lippincott-team/pull/110) | New setup | [Expected trusted-base config error confirmed in PR job log](https://github.com/Advanced-Digital-Marketing-LTDA/the-lippincott-team/actions/runs/40011425790) |
| Moderaty | [#266](https://github.com/Advanced-Digital-Marketing-LTDA/Moderaty/pull/266) | New setup | [Expected trusted-base config error confirmed in PR job log](https://github.com/Advanced-Digital-Marketing-LTDA/Moderaty/actions/runs/40011491222) |
| Advanced-Digital-Marketing-LTDA | [#33](https://github.com/Advanced-Digital-Marketing-LTDA/Advanced-Digital-Marketing-LTDA/pull/33) | New setup | [Expected trusted-base config error confirmed in PR job log](https://github.com/Advanced-Digital-Marketing-LTDA/Advanced-Digital-Marketing-LTDA/actions/runs/40011557442) |
| Top-Realtors-Cypress-TX | [#19](https://github.com/Advanced-Digital-Marketing-LTDA/Top-Realtors-Cypress-TX/pull/19) | New setup | [Expected trusted-base config error confirmed in PR job log](https://github.com/Advanced-Digital-Marketing-LTDA/Top-Realtors-Cypress-TX/actions/runs/40011612114) |
| Site-Bootstrap-ADM | [#6](https://github.com/Advanced-Digital-Marketing-LTDA/Site-Bootstrap-ADM/pull/6) | New setup | [Expected trusted-base config error confirmed in PR job log](https://github.com/Advanced-Digital-Marketing-LTDA/Site-Bootstrap-ADM/actions/runs/40011660447) |
| App-Bootstrap-ADM | [#7](https://github.com/Advanced-Digital-Marketing-LTDA/App-Bootstrap-ADM/pull/7) | New setup | [queued](https://github.com/Advanced-Digital-Marketing-LTDA/App-Bootstrap-ADM/actions/runs/40011715446) |
| Langlo | [#169](https://github.com/Advanced-Digital-Marketing-LTDA/Langlo/pull/169) | Upgrade | [Push passed; PR in_progress](https://github.com/Advanced-Digital-Marketing-LTDA/Langlo/actions/runs/40011754859) |
| AI-Comment-Moderation | [#18](https://github.com/Advanced-Digital-Marketing-LTDA/AI-Comment-Moderation/pull/18) | New setup | [queued](https://github.com/Advanced-Digital-Marketing-LTDA/AI-Comment-Moderation/actions/runs/40011812684) |
| tina-cms-mcp | [#6](https://github.com/Advanced-Digital-Marketing-LTDA/tina-cms-mcp/pull/6) | New setup | [queued](https://github.com/Advanced-Digital-Marketing-LTDA/tina-cms-mcp/actions/runs/40011868837) |
| coolify-mcp | [#13](https://github.com/Advanced-Digital-Marketing-LTDA/coolify-mcp/pull/13) | New setup | [queued](https://github.com/Advanced-Digital-Marketing-LTDA/coolify-mcp/actions/runs/40011935256) |
| workflows | [#14](https://github.com/Advanced-Digital-Marketing-LTDA/workflows/pull/14) | New setup | [queued](https://github.com/Advanced-Digital-Marketing-LTDA/workflows/actions/runs/40012014328) |
| RewardGuard | [#18](https://github.com/Advanced-Digital-Marketing-LTDA/RewardGuard/pull/18) | New setup | [queued](https://github.com/Advanced-Digital-Marketing-LTDA/RewardGuard/actions/runs/40012072397) |

## Evidence and pending activation

- Caller YAML and configuration TOML parse. Static inspection confirms immutable pins, push/PR triggers, explicit named secrets, matching optional test settings, and expected permissions. Caller files were formatted with Prettier.
- The six completed new-setup PR jobs inspected failed only with the expected `.rewardguard.toml not found on the base commit` checker error. Their logs show both named secret variables populated with masked values. This establishes delivery for those runs, not provider credential validity.
- Langlo's initial push run passed. A configuration-only diff may require no model calls; this does not establish live Jev/Haiku accuracy or credential validity.
- Application test suites and live model evaluations were not run as part of this configuration-only rollout. Existing CI runs independently.
- Secret settings and branch protections have not been changed. Their complete organization/repository configuration is not exposed by the connected tools.

## Activation checklist for each repository

1. Review the PR and its complete CI results. For a new setup, the trusted-base config error is expected because the proposed config cannot authorize its own review. Investigate any additional RewardGuard error before merging.
2. Confirm `TYPESAFE_API_KEY` and `CLAUDE_CODE_OAUTH_TOKEN` are available to that repository. Named-secret delivery is partially observed above; inference access still needs a normal eligible change.
3. Merge the reviewed setup or upgrade PR, then inspect an ordinary push and PR run using the now-trusted configuration. Do not mark activation complete solely from a setup PR.
4. Verify the default-branch rules require `rewardguard / rewardguard` after the setup is merged, following [the rollout rules](rewardguard.md). Preserve existing protections and test requirements.
5. Record actual run evidence before marking the repository active and enforced.

Content classification below 0.60 skips content checks. Individual defect probabilities below 0.60 are ignored, 0.60 to below 0.80 warn, and 0.80 or higher fail. Required evidence gaps remain `not_evaluated`.

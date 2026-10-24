# PR task-context rollout

## Requested behavior

Use PR title and description consistently to reduce false positives in code/content review and focused Haiku explanations. Resolve one revision-bound metadata snapshot; preserve live/event fallback provenance. Push runs use a unique matching associated PR rather than assuming a push event contains a PR object.

Coverage uses the actual merge base of the PR target and reviewed head. Complete and incremental intervals are distinguished; partial pushes cannot disprove claims about earlier PR work. Supporting implementation/tests/types/metadata need not be itemized in the task summary. Missing or incomplete intent evidence is explicitly unverified.

HOLLOW_FALLBACK still requires both lost required output and a consumer/check falsely accepting the substitute as success. Optional metadata absence and disclosed unverified statuses alone do not satisfy it. Git comparison failures disclose their reason class. No probability thresholds or independent security/integrity checks are disabled.

GitHub lookup uses a fixed host, no redirects, bounded responses and timeout. Tokens are stripped from the Haiku subprocess environment. Complete context is redacted and preserved within state budgets; insufficient room produces an explicit budget error. Whole-PR claim review also includes changed CI/checker text and requires complete textual evidence. Local explicit checks can use --title and --description/--description-file.

## Release and review

- Action source: `c9d3aca1ba2fc665124522cb13ebae4d597f950b`.
- Shared workflow source: `b9403b4ab4f5e3cf09ab7c4f934aab2d6723c14e`.
- Python syntax parsed; independent static review found no remaining Critical/Important defects after fixes.
- No tests were added or run locally. Existing repository CI runs normally.
- The previous internal-document filter is preserved and its13repo default-branch caller pins were verified after deployment.
- This is a new release beyond the approved internal-document-filter PR set; protected-main merges need owner approval for these new PRs.
- Merge implementation first, shared release second, then caller upgrades after review/CI. Only an explicit owner-review/C4 exception for the requested workflow pins is eligible; actual test/security/content failures remain unmerged.

## Pull requests

| Repository | PR | Scope |
| --- | --- | --- |
| RewardGuard | [#22](https://github.com/Advanced-Digital-Marketing-LTDA/RewardGuard/pull/22) | Implementation and own caller |
| workflows | [#20](https://github.com/Advanced-Digital-Marketing-LTDA/workflows/pull/20) | Shared release, own caller, and index |
| SEO-Research | [#22](https://github.com/Advanced-Digital-Marketing-LTDA/SEO-Research/pull/22) | Caller pin only |
| the-lippincott-team | [#113](https://github.com/Advanced-Digital-Marketing-LTDA/the-lippincott-team/pull/113) | Caller pin only |
| Moderaty | [#274](https://github.com/Advanced-Digital-Marketing-LTDA/Moderaty/pull/274) | Caller pin only |
| Advanced-Digital-Marketing-LTDA | [#36](https://github.com/Advanced-Digital-Marketing-LTDA/Advanced-Digital-Marketing-LTDA/pull/36) | Caller pin only |
| Top-Realtors-Cypress-TX | [#23](https://github.com/Advanced-Digital-Marketing-LTDA/Top-Realtors-Cypress-TX/pull/23) | Caller pin only |
| Site-Bootstrap-ADM | [#8](https://github.com/Advanced-Digital-Marketing-LTDA/Site-Bootstrap-ADM/pull/8) | Caller pin only |
| App-Bootstrap-ADM | [#9](https://github.com/Advanced-Digital-Marketing-LTDA/App-Bootstrap-ADM/pull/9) | Caller pin only |
| Langlo | [#183](https://github.com/Advanced-Digital-Marketing-LTDA/Langlo/pull/183) | Caller pin only |
| AI-Comment-Moderation | [#22](https://github.com/Advanced-Digital-Marketing-LTDA/AI-Comment-Moderation/pull/22) | Caller pin only |
| tina-cms-mcp | [#8](https://github.com/Advanced-Digital-Marketing-LTDA/tina-cms-mcp/pull/8) | Caller pin only |
| coolify-mcp | [#15](https://github.com/Advanced-Digital-Marketing-LTDA/coolify-mcp/pull/15) | Caller pin only |

## Current evidence and review status

The merge-base correction is published. The revised source passed independent static review; Python syntax was parsed. Existing CI evaluates the actual release. Some Jev findings have no supporting Haiku lines; they have not been automatically cleared or downgraded. The owner was asked whether to add one Jev confirmation pass for unsupported findings, with unchanged probability thresholds. Until that decision and CI/review are complete, this new release is not authorized for protected-main merging. The prior internal-document filter deployment is complete across all13 repositories.

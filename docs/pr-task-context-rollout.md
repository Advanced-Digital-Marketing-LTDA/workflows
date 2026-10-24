# PR task-context rollout

## Requested behavior

Use PR title and description consistently to reduce false positives in code/content review and focused Haiku explanations. Resolve one revision-bound metadata snapshot; preserve live/event fallback provenance. Push runs use a unique matching associated PR rather than assuming a push event contains a PR object.

Coverage uses the actual merge base of the PR target and reviewed head. Complete and incremental intervals are distinguished; partial pushes cannot disprove claims about earlier PR work. Supporting implementation/tests/types/metadata need not be itemized in the task summary. Missing or incomplete intent evidence is explicitly unverified.

HOLLOW_FALLBACK still requires both lost required output and a consumer/check falsely accepting the substitute as success. Optional metadata absence and disclosed unverified statuses alone do not satisfy it. Git comparison failures disclose their reason class. No probability thresholds or independent security/integrity checks are disabled.

GitHub lookup uses a fixed host, no redirects, bounded responses and timeout. Tokens are stripped from the Haiku subprocess environment. Context is redacted and bounded with opening/closing sections and visible omissions. Local explicit checks can use --title and --description/--description-file.

## Release and review

- Action source: `cb6c93092e6ed2cc9fadf7f5c107d0b3a0cd4a14`.
- Shared workflow source: `3fef860068aafe62e5b35b13edbc280dc850f19c`.
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

# PR task-context rollout

## Requested behavior

Use PR title and description consistently to reduce false positives in code/content review and focused Haiku explanations. Resolve one revision-bound metadata snapshot; preserve live/event fallback provenance. Push runs use a unique matching associated PR rather than assuming a push event contains a PR object.

Coverage uses the actual merge base of the PR target and reviewed head. Complete and incremental intervals are distinguished; partial pushes cannot disprove claims about earlier PR work. Supporting implementation/tests/types/metadata need not be itemized in the task summary. Missing or incomplete intent evidence is explicitly unverified.

The original HOLLOW_FALLBACK predicate and expected-value justification eligibility are preserved. Jev keeps its existing probabilities and 0.60/0.80 thresholds; Haiku remains explanation-only. No extra confirmation pass or empty-explanation dismissal was added.

GitHub lookup uses a fixed host, no redirects, bounded responses and timeout. Tokens are stripped from the Haiku subprocess environment. Complete context is redacted and preserved within state budgets; insufficient room produces an explicit budget error. Whole-PR claim review also includes changed CI/checker text and requires complete textual evidence. Local explicit checks can use --title and --description/--description-file.

## Release and review

- Action source: `1a96ebb709f785e816b453dfa1a89c3b7be4f71c`.
- Shared workflow source: `91003c38da83d57499bef6698b81fa53fb9d6c18`.
- Python syntax parsed; independent static review found no remaining Critical/Important defects after fixes.
- No tests were added or run locally. Existing repository CI runs normally.
- The previous internal-document filter is preserved and its 13 repo default-branch caller pins were verified after deployment.
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

The merge-base correction is published. The revised source passed independent static review; Python syntax was parsed. Existing CI evaluates the actual release. Some Jev findings have no supporting Haiku lines; they have not been automatically cleared or downgraded. The owner explicitly chose context fixes only and unchanged grading. Unit tests, Semgrep, and SonarCloud passed on the preceding revision; its PR RewardGuard check still failed. Final candidate CI is pending. This new release is not authorized for protected-main merging. The prior internal-document filter deployment is complete across all 13 repositories.

## Chunk separator correction

Diff-piece splitting reserves the newline appended during chunk assembly for both whole hunks and split pieces. This prevents exact-budget multi-line hunks from being reported as oversized individual lines. The final oversized-state guard and original grading remain unchanged. Python syntax parsed; no tests were added or run locally. Existing CI evaluates the new candidate.

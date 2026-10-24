# Internal-document content filter rollout

## Requested behavior

Exclude agent instructions, internal documentation directories, and conventional project documentation from website-content review targets before content-model calls. Website content and directly supporting briefs/research remain eligible; unrelated development docs elsewhere are rejected by task classification. Relevant trusted documents can still supply context.

The implementation changes only content target selection and its documentation. Normal coding/integrity checks, grading thresholds, evidence requirements, and existing application workflows remain intact.

## Immutable release

- RewardGuard action source: `8d2a8cd9894211270c6d8812eabc78587937396a`.
- Shared workflow source: `00bea39125f707474ca6d199d7e6c9ea5c907804`.
- Callers reference the shared source commit; merge commits preserve these reviewed ancestors.
- Packaged defaults apply after the release/caller updates merge. Local hook installations need a RewardGuard upgrade.
- Python syntax was parsed. No tests were added or run locally; existing GitHub CI runs normally.
- Sites that publish from docs/ can explicitly replace trusted content include/exclude lists; exclusions take precedence.

## Pull requests and merge order

Merge RewardGuard #21 first, workflows #19 second, then the remaining callers, after review and CI. These are new PRs beyond the earlier completion rollout approval. Actual blocking failures must remain unmerged; an explicit owner-review-only exception is needed for any gate that rejects the requested workflow pin as a policy edit.

| Repository | PR | Scope |
| --- | --- | --- |
| RewardGuard | [#21](https://github.com/Advanced-Digital-Marketing-LTDA/RewardGuard/pull/21) | Implementation and own caller |
| workflows | [#19](https://github.com/Advanced-Digital-Marketing-LTDA/workflows/pull/19) | Shared release, own caller, rollout index |
| SEO-Research | [#21](https://github.com/Advanced-Digital-Marketing-LTDA/SEO-Research/pull/21) | Caller pin only |
| the-lippincott-team | [#112](https://github.com/Advanced-Digital-Marketing-LTDA/the-lippincott-team/pull/112) | Caller pin only |
| Moderaty | [#273](https://github.com/Advanced-Digital-Marketing-LTDA/Moderaty/pull/273) | Caller pin only |
| Advanced-Digital-Marketing-LTDA | [#35](https://github.com/Advanced-Digital-Marketing-LTDA/Advanced-Digital-Marketing-LTDA/pull/35) | Caller pin only |
| Top-Realtors-Cypress-TX | [#22](https://github.com/Advanced-Digital-Marketing-LTDA/Top-Realtors-Cypress-TX/pull/22) | Caller pin only |
| Site-Bootstrap-ADM | [#7](https://github.com/Advanced-Digital-Marketing-LTDA/Site-Bootstrap-ADM/pull/7) | Caller pin only |
| App-Bootstrap-ADM | [#8](https://github.com/Advanced-Digital-Marketing-LTDA/App-Bootstrap-ADM/pull/8) | Caller pin only |
| Langlo | [#181](https://github.com/Advanced-Digital-Marketing-LTDA/Langlo/pull/181) | Caller pin only |
| AI-Comment-Moderation | [#21](https://github.com/Advanced-Digital-Marketing-LTDA/AI-Comment-Moderation/pull/21) | Caller pin only |
| tina-cms-mcp | [#7](https://github.com/Advanced-Digital-Marketing-LTDA/tina-cms-mcp/pull/7) | Caller pin only |
| coolify-mcp | [#14](https://github.com/Advanced-Digital-Marketing-LTDA/coolify-mcp/pull/14) | Caller pin only |

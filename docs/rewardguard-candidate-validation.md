# Candidate execution and promotion evidence

The checked-in `docs/releases/rewardguard-candidate.json` is pending. Local tests and a valid workflow source do not complete release acceptance. No provider run, release publication, caller migration or promotion was performed for this implementation.

## Candidate C and reviewed receipt P

First review immutable shared candidate C. A trusted consumer caller on its default branch must invoke `Advanced-Digital-Marketing-LTDA/workflows/.github/workflows/rewardguard.yml@C` literally; runtime expressions cannot replace a reusable workflow `uses` revision. Candidate PR source checks are provider-free. Provider-bearing canaries use only reviewed immutable workflow/action source.

Later reviewed main P supplies the acceptance receipt. The publisher verifies C ancestry and identical bytes for the reusable workflow, publisher, candidate validator, their tests and v0 protection payloads. It validates exact-P successful source CI, plus the existing old-channel RewardGuard check. That old check cannot substitute for C runtime proof. Any relevant workflow/action/policy change requires a new C and new proof.

Both action uses currently pin local tested engine `c5f97a26b37f7b5cb30af24fe44ab53e45801d82` with intended release v0.3.0. Publication/tag/release CI remain pending. Promotion independently requires the published stable tag resolve to that action SHA and exact-SHA action `ci.yml` succeeded. Never insert a made-up release SHA.

## Receipt fields

The accepted receipt has exactly these fields; values must come from reviewed source and authenticated GitHub responses. Do not replace the pending file with invented example IDs.

| Field | Required value |
| --- | --- |
| `schema_version`, `status` | `1`, `accepted` after source/evidence review |
| `candidate` | Full immutable tested shared workflow C SHA |
| `previous_channel` | Read-back v0 SHA before promotion, bound to the reviewed rollout |
| `consumer` | Actual ADM public-content consumer repository; a fork or workflows/RewardGuard itself is not the real-consumer canary |
| `caller` | Reviewed `.github/workflows/<name>.yml` caller path |
| `caller_sha256` | SHA-256 of exact reviewed caller bytes at head; caller invokes C exactly once |
| `head`, `base`, `policy` | Immutable identical initial/replay review head, comparison base and trusted policy |
| `initial`, `replay` | Objects with exactly positive integer `run_id`, `attempt`, `artifact_id`, and `digest` (`sha256:<64 hex>`) |

`artifact_id` identifies trusted **execution evidence**, named `rewardguard-execution-<run_id>-<attempt>`, with sole member `rewardguard-execution.json`. The always-run shared judge step records actual action outputs: review report artifact ID/digest, original judge exit, publication and report-upload outcomes, resolved snapshot and run identity. It includes no credentials. A following top-level upload step remains independently inspectable through the jobs API.

The publisher authenticates each execution archive by metadata/run/head/name/attempt, size and SHA-256; it then authenticates the referenced `rewardguard-review-<run_id>-<attempt>` archive with sole member `rewardguard.json`. Requests to signed storage are anonymous after a fixed-host API redirect. Extra members, symlinks, encryption, malformed/duplicate-key/nonfinite JSON, wrong digests and oversized data are rejected. API/report limits are explicit and fail closed; over 100 canary jobs require a simpler canary rather than silently truncated proof.

## Actual runtime and cache gate

Use public synthetic mapped content in an actual consumer; reports may quote source. Both canary attempts execute source-reviewed default-branch push snapshots, with the literal immutable caller digest and run `referenced_workflows` proving C. The receipt must bind distinct attempts. The report must identify the exact action SHA, head/base/policy/run/attempt, evaluated mapped content and no execution errors or required evidence gaps.

The initial run must evaluate and explain, have zero completed-record hits and demonstrate below-warning, warning and failure grades with retained warning/failure findings. Replay must restore authenticated completed records, report positive `content.result_cache_hits` and `reused: true`, retain identical scoped probabilities/findings/explanations and make zero new content HTTP attempts or explanation invocations. Missing usage phases mean the pinned tracker recorded no activity, not an inferred provider billing total. A cache archive restore alone is insufficient. Changing record identity or removing cache records must remain an explicit miss; source review should inspect those diagnostics as part of acceptance.

Expected p>=0.80 findings require a failed report/run/judge step with original exit 1; they are valid canary evidence with `errors=[]`. The gate independently requires successful actual publication, report upload, execution recording and execution upload. Incomplete evidence, missing reports, stale heads, wrong candidate/action identities or lost explanations block. The publisher parses reports as bounded data and executes no source or artifacts.

The current v0 protection payload adds the named GitHub Actions check `RewardGuard candidate validation`, retains RewardGuard, deletion/force-push protection and tag-shadow prevention. The direct publisher job is disabled pending a dedicated promotion identity and verified update restriction. Its protection check requires an independently approved PR ruleset without bypass actors. Any future writes must use force=false. Source and fake-API tests do not prove hosted protection settings or private-consumer token visibility; those remain external prerequisites.

## Forward rollback

Record the known source baseline and restore its complete compatible workflow/publisher policy through a later reviewed main commit. The v0.2.3 action cannot be dropped alone into the new transport wrapper. Review any restored publisher policy normally, revalidate its protections and CI and inspect an actual consumer run, then perform validated fast-forward promotion. There is no automatic rollback bypass or force update. The verified source references `98644db90cb691013e4a93d1539dc3de5c01e1d4` and `958ef58b886910c5370536c63252a0a81f30fe8d` are not proof of a completed runtime rollback drill.

Actions cache is interim; REWARD-1 owns durable storage and concurrency coordination. Budget work is excluded. Local hooks/installs require separate upgrades. Final rollout remains pending until publication, reviewed real evidence, protected promotion and subsequent caller acceptance are all observed.

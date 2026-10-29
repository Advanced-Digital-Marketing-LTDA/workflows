"""Exercise the production inline publisher using fake GitHub transport; no network."""
import base64
import hashlib
import io
import json
from pathlib import Path
import re
import tempfile
import textwrap
import unittest
from unittest.mock import patch
import urllib.error
import zipfile

ROOT = Path(__file__).resolve().parents[1]
P, C, B, H, BASE = ('d' * 40, 'c' * 40, 'b' * 40, 'a' * 40, 'e' * 40)
ORG = 'Advanced-Digital-Marketing-LTDA'
REPO = ORG + '/workflows'
CONSUMER = ORG + '/public-canary'
PREFIX = '/repos/' + REPO
CPREFIX = '/repos/' + CONSUMER
EPREFIX = '/repos/' + ORG + '/RewardGuard'
WORKFLOW = '.github/workflows/rewardguard.yml'
POLICY = ['.github/workflows/publish-rewardguard-v0.yml',
          '.github/workflows/validate-rewardguard-candidate.yml',
          'docs/releases/v0-branch-rules.json', 'docs/releases/v0-tag-rules.json',
          'tests/rewardguard.test.mjs', 'tests/publish_rewardguard_test.py',
          'tests/publish-rewardguard.test.mjs']


def content(data):
    return {'content': base64.b64encode(data).decode(), 'encoding': 'base64'}


def archive(member, payload):
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, 'w') as z:
        z.writestr(member, json.dumps(payload))
    return stream.getvalue()


class Fixture:
    def __init__(self):
        self.calls, self.writes, self.archives = [], [], {}
        workflow = (ROOT / WORKFLOW).read_bytes()
        self.action, self.version = re.search(rb'RewardGuard@([a-f0-9]{40}) # (v0\.\d+\.\d+)', workflow).groups()
        self.action, self.version = self.action.decode(), self.version.decode()
        rules = json.loads((ROOT / 'docs/releases/v0-branch-rules.json').read_text())['rules']
        self.data = {
            PREFIX + '/git/ref/heads/main': {'object': {'sha': P}},
            PREFIX + '/git/ref/heads/v0': {'object': {'sha': B}},
            PREFIX + '/rules/branches/v0': rules,
            PREFIX + '/rulesets?per_page=100': [{'id': 1, 'name': 'Prevent tags shadowing RewardGuard v0 channel', 'target': 'tag', 'enforcement': 'active'}],
            PREFIX + '/rulesets/1': json.loads((ROOT / 'docs/releases/v0-tag-rules.json').read_text()),
            PREFIX + '/compare/' + C + '...' + P: {'status': 'ahead', 'merge_base_commit': {'sha': C}},
            EPREFIX + '/releases/tags/' + self.version: {'draft': False, 'prerelease': False, 'published_at': '2026-10-28T21:00:00Z'},
            EPREFIX + '/git/ref/tags/' + self.version: {'object': {'type': 'commit', 'sha': self.action}},
            CPREFIX: {'full_name': CONSUMER, 'fork': False, 'default_branch': 'main'},
        }
        for name in [WORKFLOW, *POLICY]:
            data = (ROOT / name).read_bytes() if (ROOT / name).exists() else b'missing pending implementation'
            for ref in (P, C):
                self.data[PREFIX + '/contents/' + name + '?ref=' + ref] = content(data)
        for file in ('rewardguard-check.yml', 'validate-rewardguard-candidate.yml'):
            self.data[PREFIX + '/actions/workflows/' + file + '/runs?event=push&status=success&head_sha=' + P + '&per_page=100'] = {'workflow_runs': [self.success_run(file, P, REPO)]}
        self.data[EPREFIX + '/actions/workflows/ci.yml/runs?event=push&status=success&head_sha=' + self.action + '&per_page=100'] = {'workflow_runs': [self.success_run('ci.yml', self.action, ORG + '/RewardGuard')]}
        self.caller = f'jobs:\n  rewardguard:\n    uses: {REPO}/{WORKFLOW}@{C}\n'.encode()
        self.data[CPREFIX + '/contents/.github/workflows/rewardguard-canary.yml?ref=' + H] = content(self.caller)
        self.receipt = {'schema_version': 1, 'status': 'accepted', 'candidate': C,
                        'previous_channel': B, 'consumer': CONSUMER,
                        'caller': '.github/workflows/rewardguard-canary.yml',
                        'caller_sha256': hashlib.sha256(self.caller).hexdigest(),
                        'head': H, 'base': BASE, 'policy': BASE}
        self.reports, self.executions = {}, {}
        for label, attempt in [('initial', 1), ('replay', 2)]:
            run = {**self.success_run('rewardguard-canary.yml', H, CONSUMER), 'id': 100,
                   'run_attempt': attempt, 'conclusion': 'failure',
                   'referenced_workflows': [{'path': f'{REPO}/{WORKFLOW}@{C}', 'sha': C}]}
            self.data[CPREFIX + f'/actions/runs/100/attempts/{attempt}'] = run
            self.data[CPREFIX + f'/actions/runs/100/attempts/{attempt}/jobs?per_page=100'] = {
                'total_count': 1, 'jobs': [{'name': 'rewardguard / rewardguard', 'conclusion': 'failure', 'steps': [
                    {'name': 'Judge the diff', 'conclusion': 'failure'},
                    {'name': 'Record candidate execution evidence', 'conclusion': 'success'},
                    {'name': 'Upload candidate execution evidence', 'conclusion': 'success'}]}]}
            rows = [{'file': 'content/canary.md', 'unit': str(i), 'rule': 'CG_RULE_' + str(i), 'status': 'evaluated', 'probability': probability,
                     **({'explanation_status': 'completed'} if probability >= .6 else {}),
                     **({'reused': True} if attempt == 2 else {})} for i, probability in enumerate([.2, .7, .9])]
            findings = [{'rule': row['rule'], 'file': row['file'], 'source': 'content', 'probability': row['probability'],
                         'severity': 'warn' if row['probability'] < .8 else 'fail',
                         'details': [{'line': 1, 'code': 'Public synthetic content.', 'problem': 'Synthetic finding', 'fix': 'Fix it'}]}
                        for row in rows if row['probability'] >= .6]
            self.reports[label] = {
                'status': 'failed', 'failed': True, 'errors': [], 'findings': findings,
                'run_identity': {'run_id': '100', 'run_attempt': str(attempt), 'event': 'push',
                                 'head': H, 'base': BASE, 'trusted_policy': BASE, 'action_revision': self.action},
                'content': {'status': 'reviewed', 'errors': [], 'eligibility': [{'status': 'eligible'}],
                            'coverage': rows, 'result_cache_hits': 0 if attempt == 1 else 3},
                'usage': {'content': {'attempts': 3 if attempt == 1 else 0,
                                     'explanations': {'invocations': 2 if attempt == 1 else 0}}}}
            self.executions[label] = {'GITHUB_REPOSITORY': CONSUMER, 'GITHUB_RUN_ID': '100',
                'GITHUB_RUN_ATTEMPT': str(attempt), 'REVIEW_HEAD': H, 'REVIEW_BASE': BASE,
                'REVIEW_POLICY': BASE, 'JUDGE_EXIT': '1', 'PUBLICATION': 'success', 'REVIEW_UPLOAD': 'success'}
            self.receipt[label] = {'run_id': 100, 'attempt': attempt, 'artifact_id': 1000 + attempt}
        self.refresh()

    @staticmethod
    def success_run(file, sha, repo):
        return {'head_sha': sha, 'head_branch': 'main', 'event': 'push', 'conclusion': 'success',
                'status': 'completed', 'path': '.github/workflows/' + file,
                'head_repository': {'full_name': repo}, 'repository': {'full_name': repo}}

    def refresh(self):
        for label, proof in ((k, self.receipt[k]) for k in ('initial', 'replay') if k in self.receipt):
            attempt = proof['attempt']
            report_id, execution_id = 2000 + attempt, proof['artifact_id']
            report = archive('rewardguard.json', self.reports[label])
            report_digest = 'sha256:' + hashlib.sha256(report).hexdigest()
            self.executions[label].update(REPORT_ID=str(report_id), REPORT_DIGEST=report_digest[7:])
            execution = archive('rewardguard-execution.json', self.executions[label])
            digest = 'sha256:' + hashlib.sha256(execution).hexdigest()
            proof['digest'] = digest
            for aid, name, data, value in [(report_id, 'rewardguard-review', report, report_digest), (execution_id, 'rewardguard-execution', execution, digest)]:
                self.archives[str(aid)] = data
                self.data[CPREFIX + f'/actions/artifacts/{aid}'] = {'id': aid, 'name': f'{name}-100-{attempt}', 'expired': False,
                    'size_in_bytes': len(data), 'digest': value, 'workflow_run': {'id': 100, 'head_sha': H}}
        self.data[PREFIX + '/contents/docs/releases/rewardguard-candidate.json?ref=' + P] = content(json.dumps(self.receipt).encode())

    def open(self, request, timeout=30):
        url = request.full_url
        self.calls.append(url)
        if url.startswith('https://artifacts.example.blob.core.windows.net/'):
            assert request.get_header('Authorization') is None, 'credential reached artifact storage'
            return io.BytesIO(self.archives[url.rsplit('/', 1)[-1]])
        assert url.startswith('https://api.github.com/'), url
        path = url[len('https://api.github.com'):]
        if request.get_method() != 'GET':
            self.writes.append((path, request.get_method(), json.loads(request.data)))
            return io.BytesIO(b'{}')
        if path.endswith('/zip'):
            aid = path.split('/')[-2]
            raise urllib.error.HTTPError(url, 302, 'Redirect', {'Location': 'https://artifacts.example.blob.core.windows.net/' + aid}, None)
        if path in self.data:
            value = self.data[path]
            if callable(value):
                value = value()
            return io.BytesIO(json.dumps(value).encode())
        if path == PREFIX + '/git/ref/tags/v0':
            raise urllib.error.HTTPError(url, 404, 'Not found', {}, None)
        raise AssertionError('Unexpected API call: ' + path)

    def run(self):
        source = (ROOT / '.github/workflows/publish-rewardguard-v0.yml').read_text()
        code = textwrap.dedent(source.split("python -I - <<'PY'\n", 1)[1].rsplit('          PY', 1)[0])
        with tempfile.TemporaryDirectory() as temp, patch.dict('os.environ', {
                'CHANNEL_REPOSITORY': REPO, 'CANDIDATE_SHA': P, 'GITHUB_API_URL': 'https://api.github.com',
                'GH_TOKEN': 'fake-repository-token', 'GITHUB_STEP_SUMMARY': temp + '/summary'}), \
                patch('urllib.request.build_opener', return_value=self):
            try:
                exec(compile(code, '<production-inline-publisher>', 'exec'), {})
            except SystemExit as error:
                self.error = error
                return error.code
        return 0


class PublisherTests(unittest.TestCase):
    def test_real_completed_candidate_with_expected_findings_promotes_forward(self):
        f = Fixture()
        result = f.run()
        self.assertEqual(result, 0, str(getattr(f, "error", None).__cause__) if result else "")
        self.assertEqual(f.writes, [(PREFIX + '/git/refs/heads/v0', 'PATCH', {'sha': P, 'force': False})])

    def test_pending_proof_cannot_publish(self):
        f = Fixture()
        f.receipt['status'] = 'pending'; f.refresh()
        self.assertNotEqual(f.run(), 0)
        self.assertEqual(f.writes, [])

    def test_invalid_proofs_never_mutate_channel(self):
        mutations = {
            'boolean schema version': lambda f: f.receipt.update(schema_version=True),
            'boolean usage counter': lambda f: f.reports['replay']['usage']['content'].update(attempts=False),
            'boolean initial hits': lambda f: f.reports['initial']['content'].update(result_cache_hits=False),
            'missing replay': lambda f: f.receipt.pop('replay'),
            'wrong run attempt': lambda f: f.data[CPREFIX + '/actions/runs/100/attempts/2'].update(run_attempt=3),
            'report artifact wrong origin': lambda f: f.data[CPREFIX + '/actions/artifacts/2002']['workflow_run'].update(id=101),
            'wrong ancestor': lambda f: f.data[PREFIX + '/compare/' + C + '...' + P].update(merge_base_commit={'sha': B}),
            'changed workflow': lambda f: f.data.__setitem__(PREFIX + '/contents/' + WORKFLOW + '?ref=' + C, content(b'changed workflow')),
            'changed publisher': lambda f: f.data.__setitem__(PREFIX + '/contents/' + POLICY[0] + '?ref=' + C, content(b'changed publisher')),
            'changed rules': lambda f: f.data.__setitem__(PREFIX + '/contents/' + POLICY[2] + '?ref=' + C, content(b'changed rules')),
            'no candidate CI': lambda f: f.data.__setitem__(PREFIX + '/actions/workflows/validate-rewardguard-candidate.yml/runs?event=push&status=success&head_sha=' + P + '&per_page=100', {'workflow_runs': []}),
            'no release CI': lambda f: f.data.__setitem__(EPREFIX + '/actions/workflows/ci.yml/runs?event=push&status=success&head_sha=' + f.action + '&per_page=100', {'workflow_runs': []}),
            'unpublished release': lambda f: f.data[EPREFIX + '/releases/tags/' + f.version].update(published_at=None),
            'wrong action tag': lambda f: f.data[EPREFIX + '/git/ref/tags/' + f.version]['object'].update(sha=B),
            'changed channel': lambda f: f.data[PREFIX + '/git/ref/heads/v0']['object'].update(sha=C),
            'old workflow runtime': lambda f: f.data[CPREFIX + '/actions/runs/100/attempts/2'].update(referenced_workflows=[{'path': REPO + '/' + WORKFLOW + '@v0', 'sha': B}]),
            'wrong canary head': lambda f: f.data[CPREFIX + '/actions/runs/100/attempts/2'].update(head_sha=B),
            'PR event unreviewed': lambda f: f.data[CPREFIX + '/actions/runs/100/attempts/2'].update(event='pull_request'),
            'execution publication error': lambda f: f.executions['replay'].update(PUBLICATION='failure'),
            'execution upload error': lambda f: f.executions['replay'].update(REVIEW_UPLOAD='failure'),
            'wrong action runtime': lambda f: f.reports['replay']['run_identity'].update(action_revision=B),
            'judge execution error': lambda f: f.reports['replay'].update(errors=['provider failure']),
            'no mapped content': lambda f: f.reports['initial']['content'].update(eligibility=[]),
            'no restored results': lambda f: f.reports['replay']['content'].update(result_cache_hits=0),
            'regraded replay': lambda f: f.reports['replay']['usage']['content'].update(attempts=1),
            'lost finding': lambda f: f.reports['replay']['findings'].pop(),
            'lost explanation': lambda f: f.reports['replay']['findings'][0].update(details=[]),
            'new explanation invocation': lambda f: f.reports['replay']['usage']['content']['explanations'].update(invocations=1),
        }
        for name, mutate in mutations.items():
            with self.subTest(name=name):
                f = Fixture(); mutate(f)
                if name != 'report artifact wrong origin':
                    f.refresh()
                self.assertNotEqual(f.run(), 0)
                self.assertEqual(f.writes, [])


    def test_missing_receipt_and_mismatched_pins_block(self):
        f = Fixture()
        f.data[PREFIX + '/contents/docs/releases/rewardguard-candidate.json?ref=' + P] = content(b'{}')
        self.assertNotEqual(f.run(), 0)
        self.assertEqual(f.writes, [])
        f = Fixture()
        path = PREFIX + '/contents/' + WORKFLOW + '?ref=' + P
        source = base64.b64decode(f.data[path]['content'])
        source = source.replace(f.action.encode(), B.encode(), 1)
        f.data[path] = content(source)
        self.assertNotEqual(f.run(), 0)
        self.assertEqual(f.writes, [])

    def test_archive_corruption_and_redirect_cannot_forge_evidence(self):
        f = Fixture()
        f.archives['1002'] += b'corruption'
        self.assertNotEqual(f.run(), 0)
        self.assertEqual(f.writes, [])
        f = Fixture()
        original = f.open
        def wrong_redirect(request, timeout=30):
            if request.full_url.endswith('/1002/zip'):
                raise urllib.error.HTTPError(request.full_url, 302, 'Redirect', {'Location': 'https://attacker.example/report'}, None)
            return original(request, timeout)
        with patch.object(f, 'open', side_effect=wrong_redirect):
            self.assertNotEqual(f.run(), 0)
        self.assertEqual(f.writes, [])

    def test_missing_candidate_protection_and_racing_main_or_channel_block(self):
        f = Fixture()
        f.data[PREFIX + '/rules/branches/v0'][-1]['parameters']['required_status_checks'].pop()
        self.assertNotEqual(f.run(), 0)
        self.assertEqual(f.writes, [])
        for what in ('main', 'protection'):
            with self.subTest(race=what):
                f = Fixture()
                path = PREFIX + ('/git/ref/heads/main' if what == 'main' else '/rules/branches/v0')
                original = f.data[path]
                calls = [0]
                def advance():
                    calls[0] += 1
                    return original if calls[0] == 1 else ({'object': {'sha': C}} if what == 'main' else [])
                f.data[path] = advance
                f.run()
                self.assertEqual(f.writes, [])


if __name__ == '__main__':
    unittest.main()

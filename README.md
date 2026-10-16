# Shared organization workflows

## Codecov

Call `.github/workflows/codecov.yml` after your test job generates and uploads a
coverage report. The reusable workflow downloads the artifact from the same run
and uploads the report to Codecov for the **calling repository**. It does not
install dependencies or run tests, so callers can use their own language, test
runner, and toolchain.

Add a `CODECOV_TOKEN` Actions secret in each calling repository, or an organization
secret available to the intended repositories. Configure the matching repository
in Codecov. Do not put tokens in workflow files.

For a project that already generates `coverage/lcov.info`, add these parts to its
workflow. Keep its existing test and installation steps:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # Existing checkout, installation, and coverage-producing test steps go here.
      - name: Upload coverage artifact
        uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4
        with:
          name: coverage
          path: coverage/lcov.info
          if-no-files-found: error
          retention-days: 1

  codecov:
    needs: test
    if: ${{ github.event_name == 'push' || github.event.pull_request.head.repo.full_name == github.repository }}
    uses: Advanced-Digital-Marketing-LTDA/workflows/.github/workflows/codecov.yml@<published-commit-sha>
    permissions:
      contents: read
    with:
      artifact-name: coverage
    secrets:
      CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
```

Replace `<published-commit-sha>` with a full commit SHA containing this workflow.
The workflow must be published before another repository can call it. Each caller
must opt in; this does not automatically change organization repositories. If the
workflow repository is private, its Actions access settings must permit callers.

The artifact downloads into `coverage/`. Uploading `coverage/lcov.info` stores the
file as `lcov.info`, so its downloaded path is `coverage/lcov.info`. For another
report format, pass `coverage-file` with its downloaded path, for example
`coverage/cobertura.xml`. The artifact name defaults to `coverage`.

Fork pull requests skip the secret-backed upload job and can still run tests.
Report download and Codecov upload errors fail the job. Successful local coverage
generation does not verify GitHub execution or Codecov receipt.

Run the local workflow contract tests with `node --test tests/*.test.mjs`.

## Coveralls

The existing `.github/workflows/coveralls.yml` remains available separately.

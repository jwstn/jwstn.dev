# Deployments

One Vercel project serves two environments:

| Environment | Trigger                    | Vercel environment | URL                                        |
| ----------- | -------------------------- | ------------------ | ------------------------------------------ |
| Staging     | Every push to `main`       | Preview            | Generated deployment URL from the workflow |
| Production  | A published GitHub Release | Production         | https://www.jwstn.dev                      |

`main` is the only long-lived branch. Feature branches merge into `main` through pull
requests; PR previews use the project's Preview environment. Production deliberately lags
`main` between releases.

## Workflows

- `.github/workflows/preview.yaml` deploys a Preview for pull requests.
- `.github/workflows/staging.yaml` deploys a Preview for every push to `main`. The generated
  URL and the smoke result are written to the workflow summary.
- `.github/workflows/release.yaml` validates a release tag, deploys a Preview of that tag,
  smoke-tests it, then deploys Production and smoke-tests both the deployment and the domain.

`production.yaml` was removed so a merge to `main` cannot deploy Production. Automatic
Production deployments in the Vercel project's Git settings must also stay disabled; only the
release workflow deploys Production.

## Releasing

A release tag must be semver-shaped (`v1.2.3`) and must point at the current `main` HEAD.

1. Merge the changes into `main` and wait for the staging workflow to pass.
2. Create a GitHub Release from the current `main` HEAD with a new tag.
3. Publishing the release starts the release workflow:
   - the tag commit and `main` HEAD must match;
   - a Preview of the tag is deployed and smoke-tested;
   - Production is deployed from the same commit and smoke-tested on the deployment URL and
     `https://www.jwstn.dev`.
4. The workflow summary records the tag, commit, Preview URL, Production URL and smoke result.

Publishing any release, including a prerelease, deploys Production. Use a manual dry run for a
rehearsal instead.

### Dry run

Run the **Release** workflow manually with an existing tag and `dry_run` enabled. It validates
the tag, writes the plan to the summary and deploys nothing.

### Rollback

Promote the previous Production deployment to the domain (Vercel dashboard or
`vercel promote <deployment-url>`), then run the Production smoke checks. No DNS change is
involved.

## Required configuration

Repository secrets:

- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_TOKEN`
- `VERCEL_AUTOMATION_BYPASS_SECRET` (optional, needed when Preview deployments are protected)

Vercel dashboard:

- Disable automatic Git deployments for the project. The workflows deploy both Preview and
  Production, so a Vercel Git integration would only create duplicate deployments and could
  bypass the release gate.
- Create a Protection Bypass for Automation secret and store it as
  `VERCEL_AUTOMATION_BYPASS_SECRET` if Preview deployments require authentication.
- Set the project framework preset to Astro for the current app. Before the TanStack Start
  cutover, switch the preset to TanStack Start/Nitro and Node 24, then merge the migration.
  The last Astro Production deployment remains available for rollback until the first release.

## Smoke checks

The workflows run `scripts/smoke.mjs` when the checked-out app provides it (TanStack Start),
then run `scripts/deploy-smoke.mjs` for the routes common to Astro and TanStack Start, the
blog, RSS and sitemap. `deploy-smoke.mjs` accepts:

- `BASE_URL` — deployment URL to check.
- `VERCEL_AUTOMATION_BYPASS_SECRET` — sent as `x-vercel-protection-bypass`.
- `EXPECTED_COMMIT` — optional commit SHA. When the app exposes a `x-build-commit` response
  header or a `build-commit` meta tag, the smoke script verifies it; otherwise it reports that
  the marker is not exposed and continues. Set `REQUIRE_BUILD_MARKER=true` to make a missing
  marker fail once the app exposes one.

`scripts/release-plan.mjs` is the release decision: it validates the tag and SHAs and writes
the plan, GitHub outputs and job summary. Its tests run with:

```sh
node --test scripts/release-plan.test.mjs
```

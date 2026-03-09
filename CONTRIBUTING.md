# Contributing

Thanks for contributing to Evergarden Font Manager.

## Prerequisites

- Node.js 20+
- pnpm 10+
- Git
- Windows is recommended for release packaging and installer validation

## Fork And Clone

1. Fork the repository on GitHub.
2. Clone your fork:

```bash
git clone https://github.com/<your-username>/evergarden-font-manager.git
cd evergarden-font-manager
```

3. Add the main repo as `upstream`:

```bash
git remote add upstream https://github.com/<org-or-owner>/evergarden-font-manager.git
```

4. Install dependencies:

```bash
pnpm install
```

## Create A Branch

Create a focused feature/fix branch from `main`:

```bash
git checkout main
git pull upstream main
git checkout -b feat/<short-description>
```

## Development Commands

- Start app in dev mode: `pnpm dev`
- Lint: `pnpm lint`
- Auto-fix lint issues: `pnpm lint:fix`
- Format: `pnpm format`
- Verify formatting only: `pnpm format:check`
- Build app: `pnpm build`

## Commit Guidelines

- Keep commits focused and small.
- Write commit messages in imperative style.
- Example:

```bash
git commit -m "feat(pairing): add shuffle button for font pair cards"
```

## Push Behavior (Husky Pre-Push Hook)

This repo has a `pre-push` hook that runs:

1. `pnpm format`
2. `pnpm lint:fix`
3. Fails the push if files changed, so you can review and commit fixes
4. `pnpm format:check`
5. `pnpm lint`

If push fails because files were auto-fixed:

```bash
git add .
git commit -m "chore: apply formatting and lint fixes"
git push
```

## Open A Pull Request

1. Push your branch to your fork:

```bash
git push -u origin feat/<short-description>
```

2. Open a PR from your fork branch to `main`.
3. In the PR description include:

- What changed
- Why it changed
- How you tested it
- Screenshots/video for UI changes

4. Link related issues, if any.

## Keep Your Fork Updated

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

## Tagging And Release Flow

Windows release is automated by `.github/workflows/release-win.yml` on tags that match `v*.*.*`.

1. Bump `package.json` version.
2. Commit and push that version bump.
3. Create a matching tag (`v<package.json version>`):

```bash
git tag v0.1.0-beta.5
git push origin v0.1.0-beta.5
```

For stable releases, use semantic tags like:

```bash
git tag v1.2.3
git push origin v1.2.3
```

Important: CI validates that the pushed tag exactly matches `v${package.json.version}`.

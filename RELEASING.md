# Releasing the desktop app

The desktop app is built and released from this repository by
`.github/workflows/build-desktop-apps.yml`. Two channels, published on every push
to their branch:

| branch | tag | release | app identity | |
|---|---|---|---|---|
| `main` | `latest` | edge-ml | `edge-ml` / `org.edge-ml.explorer` | |
| `beta` | `beta` | edge-ml beta | `edge-ml beta` / `org.edge-ml.explorer.beta` | prerelease |

Both install side by side, so you can run stable and beta on one machine.

Download links never change, because each channel keeps one rolling release whose
tag is moved to the newest build:

```
https://github.com/edge-ml/frontend/releases/download/latest/edge-ml-setup-x64.exe
https://github.com/edge-ml/frontend/releases/download/beta/edge-ml-beta-setup-x64.exe
```

## Versioning

`src-tauri/tauri.conf.json` -> `version` is the single source of truth. It is plain
`MAJOR.MINOR.PATCH` with no suffix, because the Windows and macOS bundlers want a
numeric version.

**A merge from `beta` to `main` is a release, so the version must be bumped in that
PR.** CI enforces it: the `resolve` job fails in seconds if `main` declares a version
that is not newer than the last released one (it compares against the highest `v*`
tag). That is deliberately a human edit — auto-incrementing would mean the workflow
committing back to `main`, which risks re-triggering itself and leaves the repo
declaring a different version from the artifact it shipped.

Which part to bump:

| | when |
|---|---|
| **patch** | bug fixes only, nothing new for the user |
| **minor** | anything a user would notice — new feature, UI change, new export target |
| **major** | a breaking change in what the app talks to, or a deliberate milestone |

Minor is the normal case here.

Pushes to `beta` need no bump: beta is a rolling prerelease of the *next* version.
Its release notes show `X.Y.Z-beta+<sha>` so a beta build is still identifiable.

Because the installers are named without a version (that is what keeps the URLs
stable), the version is recorded in two places instead:

- the release notes, as `**Version X.Y.Z**`
- an immutable `vX.Y.Z` git tag pushed for every stable release

The channel tags move constantly, so those `vX.Y.Z` tags are the release history.
Any past build can be reproduced with
`gh workflow run build-desktop-apps.yml --ref vX.Y.Z`.

## Cutting a release

1. Open the `beta` -> `main` PR.
2. Bump `version` in `src-tauri/tauri.conf.json` in that PR.
3. Merge. The workflow builds Windows + macOS, updates the `edge-ml` release, and
   pushes the `vX.Y.Z` tag.

To get a build without releasing, use
`gh workflow run build-desktop-apps.yml --ref beta`. A dispatch from any branch other
than `main` or `beta` builds but refuses to publish, so a feature branch cannot
overwrite a channel.

## Known gaps

- **The installers are not code signed.** Windows SmartScreen warns on every
  download, and macOS Gatekeeper reports the dmg as damaged on machines that did not
  build it. Distributing to anyone outside the team needs a certificate first.
- `src-tauri/tauri.beta.conf.json` repeats the whole `app.windows[0]` entry on
  purpose: Tauri deep-merges objects but **replaces arrays**, so a partial entry
  would silently drop the window width, height and resizable flags. Keep the two in
  sync.

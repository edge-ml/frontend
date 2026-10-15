# Browser end-to-end tests

These drive a real browser against a **deployed** environment. They are separate
from the vitest suite in `tests/`, which mocks the network with msw.

```bash
npx playwright install chromium        # once
cat > ~/.edge-ml-e2e.env <<'ENV'
E2E_USER=<username>
E2E_PASS=<password>
ENV
chmod 600 ~/.edge-ml-e2e.env

set -a && . ~/.edge-ml-e2e.env && set +a
npx playwright test --config playwright.e2e.config.js
```

`E2E_BASE_URL` overrides the target (default `https://beta.edge-ml.org`). The
credentials must belong to an account whose project has datasets carrying
metadata fields, otherwise the leave-one-out specs have nothing to assert on.

Use `playwright.e2e.config.js`, not `playwright.config.jsx`: the latter is the
unmodified scaffold and its `testDir` points at `tests/`, so it would try to run
the vitest files.

## Things these tests had to work around

Worth knowing before adding more, since each one cost a debugging round:

- **Navigate by clicking the nav links, not `page.goto`.** A full reload of the
  `/Models` route does not re-bootstrap; the page sits on "Loading...". SPA
  navigation is also what a user actually does.
- **A 401 on `/auth/user` right after load is normal.** The app fires it once
  before the token is restored; the retry carries the Bearer header.
- **Do not use the "select all compatible datasets" checkbox.** It selects
  datasets that share no time series (wisdm and utd_mhad have different sensors),
  and the wizard then correctly refuses to continue, leaving Next disabled. Tick
  individual rows from one source instead.
- **Mantine Selects need focus + ArrowDown**, not a click: the input is
  read-only and sits below the fold inside the modal's own scroll container, so
  a click is either out of viewport or swallowed. See `openCombobox`.
- Training is polled through `GET /ml/models/` with the token from
  `localStorage`, because the UI only shows coarse progress.

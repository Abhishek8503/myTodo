Deployment checklist and notes
=============================

This project is a Vite + React SPA that is deployed to GitHub Pages using the GitHub Actions Pages artifact + deploy flow.

Required environment
--------------------
- Node: 20 (pinned in `.nvmrc`)
- Repo secrets (set in GitHub → Settings → Secrets → Actions):
  - `VITE_SUPABASE_URL` — your Supabase URL
  - `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

Recommended CI configuration
----------------------------
- The provided workflow (`.github/deploy.yml`) uses `npm ci`, builds the app, creates `dist/.nojekyll` and `dist/404.html`, uploads the `dist` artifact and then deploys via `actions/deploy-pages`.
- This avoids committing built files to the repo and prevents Jekyll from running on the build.

If you see Jekyll logs or a Pages build error mentioning `/github/workspace/docs`:
- Open your repository Settings → Pages and ensure the "Build and deployment" source is set to "GitHub Actions" (or not set to `main / docs`).
- If you must use `main / docs` for Pages, update the workflow to copy `dist` into a `docs/` folder and commit it (note: this will add built files to your repo history).

Quick local deploy/preview steps
-------------------------------
1. Use correct Node version:
   ```bash
   nvm use 20
   # or
   node -v  # should show v20.x
   ```
2. Install and build:
   ```bash
   npm ci
   VITE_SUPABASE_URL="https://..." VITE_SUPABASE_ANON_KEY="..." npm run build
   ```
3. Preview locally:
   ```bash
   npm run preview
   # open http://localhost:4173 (default)
   ```

CI troubleshooting
------------------
- Make sure the repository Secrets are set (see above). The workflow maps these into the build step.
- If the Pages UI still shows Jekyll building `docs/`, switch Pages to use "GitHub Actions" as the source.
- Check the Actions run logs: the `Upload production build` and `Deploy to GitHub Pages` steps must both succeed for the site to be published.

Post-deploy checks
------------------
- Visit the published URL from the Pages settings and test flows that use Supabase (reads, writes, auth). If something fails, check browser console for missing env vars or network errors.
- If your app uses client-side routing, confirm refreshes on nested routes resolve (we copy `index.html` to `404.html` in CI to help with this).

Contact
-------
If you want me to also switch the workflow to *commit `dist` into `docs/`* (not recommended) or to *add caching/lint/test steps*, say so and I'll apply those edits.

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Base44 Dev Environment

This is a **frontend-only** Vite + React 19 + TanStack Router app (party game
"Mourad's Ville"). No backend, no database, no external services, no secrets.

### Running the app

```sh
docker compose -f docker-compose.base44.yml up -d
```

- Base image: `oven/bun:1.2` (Bun runtime + Vite dev server)
- Source is bind-mounted at `/app`; `node_modules` is an anonymous volume
- `bun install` runs on every container start, then `vite dev --host 0.0.0.0`
- Vite dev server listens on container port 5173, mapped to host port 3000
- Live reload (HMR) is active — edits appear without rebuilding the image

### Verifying it works

```sh
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/   # expect 200
```

The served HTML should contain `/@vite/client` and `/src/main.tsx` (dev server
indicators), confirming live source is served — not a prebuilt bundle.

### Notes

- `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is passed through from the platform
  environment so Vite accepts the preview's external hostname.
- `bunfig.toml` has a 24h supply-chain guard (`minimumReleaseAge`); locked
  versions are already resolved so installs are unaffected.

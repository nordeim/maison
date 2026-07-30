# Maison on Windows with WSL containers

This guide deploys the Maison monorepo on a Windows 10/11 computer by running Linux containers through WSL, with PostgreSQL and Redis as local containers and the Next.js storefront served from a production container. It also publishes the site securely through your existing Cloudflare Tunnel without opening router ports. [github](https://github.com/tanordheim)

> **Important:** Maison’s documented target production stack uses Vercel plus managed Neon, Sanity, Stripe, Resend, Upstash, Trigger.dev, and Cloudflare services. This guide is therefore a **self-hosted Windows/WSL deployment profile**, suitable for home-lab, UAT, demos, or a private small-scale deployment—not a replacement for managed production hosting without further operational work. [github](https://github.com/tanordheim)

## What you will build

```text
Internet visitor
      |
https://maison.jesspete.shop
      |
Cloudflare Tunnel (outbound-only encrypted connection)
      |
Windows PC -> WSL -> Linux container host
      |
Maison web container :3000
      |
PostgreSQL container :5432
Redis container      :6379
```

The Cloudflare Tunnel routes the public hostname to a service on the same computer; it does not require inbound router port-forwarding or a public IP address. Your existing tunnel instructions use a DNS route plus an ingress rule in `~/.cloudflared/config.yml`, with a catch-all `http_status:404` rule last. [mybtoys](https://mybtoys.com/shop/fluffy-doos-dash/?bvstate=pg:2/ct:r)

## Before you begin

### Hardware and account checklist

Use a Windows 10 version 2004 or later machine, or Windows 11, with virtualization enabled in UEFI/BIOS. Plan for at least 8 GB RAM, 20 GB available SSD space, a stable Internet connection, and an administrator account on the PC.

Prepare these accounts and values before deployment:

- A Cloudflare account controlling the domain/subdomain you will publish.
- A Stripe account, using **test-mode keys** for the first deployment.
- A Sanity project and API token if the site is to use live CMS content.
- A Resend account and a domain-verified sender address if transactional mail is enabled.
- Optional but recommended: Upstash, Trigger.dev, PostHog, and Sentry accounts, because the repository identifies these services for rate limiting, jobs, analytics, and error monitoring. [github](https://github.com/tanordheim)
- The GitHub URL: `https://github.com/nordeim/maison.git`
- A hostname such as `maison.jesspete.shop`.

Do **not** copy `.env.local` from GitHub into a server. The repository exposes both `.env.example` and a tracked `.env.local`; use the example template to create a fresh local secret file, and rotate any real secret that may ever have been committed. [github](https://github.com/tanordheim)

### Decide the deployment mode

| Mode | What runs locally | Best use |
|---|---|---|
| **Recommended first deployment** | Maison, PostgreSQL, Redis; managed third-party accounts for Stripe/Sanity/email/etc. | Testing and lower operational risk |
| **Fully local data services** | Maison, PostgreSQL, Redis; Stripe still external because it processes payments | Offline-like development/UAT |
| **Public commercial store** | Prefer documented managed production services and a hardened Linux server or Vercel | Real sales and customer data |

The application requires Node.js 22 or later and pnpm 11.17.0, while the repo supplies Docker Compose for local PostgreSQL and Redis. It expects PostgreSQL 17 and distinguishes a pooled database URL from a direct, unpooled database URL for migrations. [github](https://github.com/tanordheim)

## Install WSL container feature pack

Microsoft’s current WSL container capability provides a built-in `wslc.exe` command-line tool for pulling, running, and managing Linux containers. Microsoft documents it as a new WSL container feature, with examples for port publishing, listing images, and starting/stopping containers. [github](https://github.com/maisonsmd)

### Install WSL

1. Right-click the **Start** button.
2. Select **Terminal (Admin)** or **Windows PowerShell (Admin)**.
3. Run:

```powershell
wsl --install
```

4. Restart the computer when Windows requests it.
5. After restarting, open **Ubuntu** from the Start menu.
6. Create the Linux username and password when prompted.

If WSL is already installed, update it instead:

```powershell
wsl --update
wsl --shutdown
```

Verify the installation in an Administrator PowerShell window:

```powershell
wsl --status
wsl --version
```

### Verify WSL containers

Open an ordinary PowerShell window and run:

```powershell
wslc run --rm -it ubuntu:latest bash -c "echo WSL containers are working"
```

If it prints `WSL containers are working`, the WSL container feature pack is operational. The `wslc` command is intended to run Linux containers directly from Windows, and Microsoft’s example maps an Nginx container port with `-p 8080:80`. [github](https://github.com/maisonsmd)

### Practical container-tool choice

`wslc` is appropriate for simple container runs, but Maison has multiple coordinated services—web app, PostgreSQL, Redis, and optionally Stripe CLI—so use **Docker Engine with Docker Compose inside Ubuntu WSL** for this guide. The repository specifically supplies `docker-compose.yml` for its local PostgreSQL, Redis, and Stripe CLI services. [github](https://github.com/tanordheim)

In the Ubuntu terminal, install Docker Engine and Compose plugin:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git nano
```

Install Docker using Docker’s official Ubuntu installation method, then confirm:

```bash
docker --version
docker compose version
```

Allow your Linux user to run Docker without typing `sudo` every time:

```bash
sudo usermod -aG docker $USER
exit
```

Close Ubuntu, reopen it, then check:

```bash
docker ps
```

Expected result: a table with no containers yet, not a “permission denied” error.

## Prepare the Windows workspace

Keep the project files inside the Linux filesystem—not under `C:\Users\...` or `/mnt/c/...`—for better Linux filesystem behavior and faster Node dependency installation.

In Ubuntu WSL:

```bash
mkdir -p ~/projects
cd ~/projects
git clone https://github.com/nordeim/maison.git
cd maison
```

Check the project:

```bash
git status
ls
```

You should see folders such as `apps`, `packages`, `services`, `infrastructure`, and files including `docker-compose.yml`, `package.json`, `.env.example`, and `pnpm-workspace.yaml`. The primary application is `apps/web`; the repo also contains a Sanity Studio app and shared packages for auth, database, API, payments, UI, email, and configuration. [github](https://github.com/tanordheim)

## Install Node and pnpm

Install Node.js 22 LTS in Ubuntu. The simplest reliable approach for beginners is `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Close and reopen Ubuntu, then run:

```bash
nvm install 22
nvm use 22
node --version
```

Enable Corepack and install the repository’s required pnpm release:

```bash
corepack enable
corepack prepare pnpm@11.17.0 --activate
pnpm --version
```

Install all project dependencies:

```bash
cd ~/projects/maison
pnpm install
```

The repository specifies Node.js 22 or later and pnpm 11.17.0, and uses pnpm workspaces plus Turborepo task orchestration. [github](https://github.com/tanordheim)

## Configure your private settings

### Create `.env.local`

Create a private environment file from the safe template:

```bash
cd ~/projects/maison
cp .env.example .env.local
chmod 600 .env.local
nano .env.local
```

Never paste secrets into GitHub issues, commits, screenshots, chat, or public documents. Keep `.env.local` private and confirm it is ignored before any `git add`:

```bash
git check-ignore .env.local
```

### Minimum configuration

Fill in at least these values in `.env.local`:

```dotenv
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...

RESEND_API_KEY=...
EMAIL_FROM=...

UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

TRIGGER_SECRET_KEY=...
NEXT_PUBLIC_POSTHOG_KEY=...
SENTRY_DSN=...
```

Maison documents these as critical settings: database URLs, Better Auth URL/secret, Stripe keys/webhook secret, Sanity identifiers/token, Resend, Upstash, Trigger.dev, analytics, and optional Sentry. The documented migration requirement is particularly important: migrations must use `DATABASE_URL_UNPOOLED`, not a PgBouncer-style pooled connection. [github](https://github.com/tanordheim)

Generate a secure authentication secret:

```bash
openssl rand -base64 32
```

Copy the printed value into:

```dotenv
BETTER_AUTH_SECRET=PUT_THE_GENERATED_VALUE_HERE
```

### Local database URLs

First open `docker-compose.yml` and inspect the actual configured database username, password, and database name:

```bash
nano docker-compose.yml
```

Then set your database URLs to match it. A typical local setup looks like this:

```dotenv
DATABASE_URL=postgresql://maison:change-this@localhost:5432/maison
DATABASE_URL_UNPOOLED=postgresql://maison:change-this@localhost:5432/maison
```

Do not assume the sample credentials above are correct; the compose file is the authority for your clone.

### Local-first configuration

For the first local boot, set:

```dotenv
BETTER_AUTH_URL=http://localhost:3000
```

Keep it at localhost until the site works locally. Later, before exposing the public hostname, change it to:

```dotenv
BETTER_AUTH_URL=https://maison.jesspete.shop
```

Use your actual public hostname. Better Auth depends on the correct public app URL for callback/session behavior, and the repo explicitly warns that production auth will fail if it remains set to localhost. [github](https://github.com/tanordheim)

## Start PostgreSQL and Redis

From the repository root:

```bash
cd ~/projects/maison
docker compose up -d postgres redis
```

Check that both services are running:

```bash
docker compose ps
```

Expected result: `postgres` and `redis` show as running. The project’s documented local sequence is to start these two services before setting up the database. [github](https://github.com/tanordheim)

If either fails, inspect its logs:

```bash
docker compose logs postgres --tail=100
docker compose logs redis --tail=100
```

## Create database tables and demo catalog

Run:

```bash
pnpm db:setup
```

This repository command generates/applies migrations and seeds its initial catalog of eight collections and 20 products. [github](https://github.com/tanordheim)

If it fails with an error mentioning “prepared statement,” re-check that `DATABASE_URL_UNPOOLED` uses the direct database connection. The repo specifically identifies a pooled connection as incompatible for migrations. [github](https://github.com/tanordheim)

## Test the application locally

Start the development server first:

```bash
pnpm dev
```

Open this in the Windows browser:

```text
http://localhost:3000
```

WSL normally forwards localhost ports to Windows, so the page should be reachable from Edge, Chrome, or Firefox on the same PC.

In a second Ubuntu terminal, run:

```bash
curl -I http://localhost:3000
curl -I http://localhost:3000/products
```

Then run the application checks:

```bash
pnpm check-types
pnpm test
pnpm build
pnpm test:e2e
```

The repository documents `check-types`, unit/integration tests, a production build, and Playwright end-to-end testing; it says E2E testing requires the production build first. [github](https://github.com/tanordheim)

Do not proceed to public exposure until the homepage and `/products` render and the build succeeds.

## Build a production container

The repository’s Docker Compose file is documented for database/cache/Stripe CLI services, not necessarily a complete web-app production image. Create the following two files in the repository root to package the Next.js web application cleanly.

### Create `.dockerignore`

```bash
nano .dockerignore
```

Paste:

```dockerignore
.git
.github
node_modules
**/node_modules
.next
**/.next
.env
.env.*
!.env.example
coverage
playwright-report
test-results
pnpm-debug.log*
```

### Create `Dockerfile`

```bash
nano Dockerfile
```

Paste:

```dockerfile
FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.17.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/studio/package.json ./apps/studio/package.json
COPY packages ./packages
COPY tooling ./tooling
COPY services/workers/package.json ./services/workers/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app /app
EXPOSE 3000
CMD ["pnpm", "--filter", "@maison/web", "start"]
```

This image intentionally does not copy `.env.local` into the image. Runtime secrets must be provided when the container starts.

> **Check the web package name:** Before building, confirm the actual workspace package name:
>
> ```bash
> cat apps/web/package.json | grep '"name"'
> ```
>
> If it is not `@maison/web`, replace that name in the last line of the Dockerfile.

### Add the web service

Create an override file, preserving the repository’s own compose file untouched:

```bash
nano compose.selfhost.yml
```

Paste:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: maison_web
    restart: unless-stopped
    env_file:
      - .env.local
    depends_on:
      postgres:
        condition: service_started
      redis:
        condition: service_started
    ports:
      - "127.0.0.1:3000:3000"
```

This publishes the web server only on the same PC at `127.0.0.1:3000`; it deliberately does **not** expose the application to every device on your LAN. Cloudflare Tunnel will connect locally and publish it safely.

Build and start:

```bash
docker compose -f docker-compose.yml -f compose.selfhost.yml up -d --build
```

Check status and logs:

```bash
docker compose -f docker-compose.yml -f compose.selfhost.yml ps
docker logs maison_web --tail=100
```

Test locally:

```bash
curl -I http://127.0.0.1:3000
```

Open in Windows:

```text
http://localhost:3000
```

## Make it start after reboot

Docker containers configured with `restart: unless-stopped` restart when the Docker service starts. Ensure Docker Engine in your Ubuntu WSL distribution starts automatically or start it after logging in.

For a reliable self-hosted workstation, create a simple script:

```bash
mkdir -p ~/bin
nano ~/bin/start-maison.sh
```

Paste:

```bash
#!/usr/bin/env bash
set -e
cd ~/projects/maison
docker compose -f docker-compose.yml -f compose.selfhost.yml up -d
```

Make it executable:

```bash
chmod +x ~/bin/start-maison.sh
```

Run it whenever needed:

```bash
~/bin/start-maison.sh
```

## Publish through Cloudflare Tunnel

### Before publishing

Do not expose a development server publicly. Use the production container above, confirm the site works at `http://localhost:3000`, and change these settings in `.env.local`:

```dotenv
BETTER_AUTH_URL=https://maison.jesspete.shop
```

Replace `maison.jesspete.shop` with your chosen hostname. Recreate the production container after changes that affect build-time/public Next.js settings:

```bash
docker compose -f docker-compose.yml -f compose.selfhost.yml up -d --build
```

The supplied tunnel instructions state that all tunnel services are publicly reachable by default, while HTTPS is automatic and the home origin remains hidden. Put Cloudflare Access in front of preview, admin, or non-customer-facing deployments. [mybtoys](https://mybtoys.com/shop/fluffy-doos-dash/?bvstate=pg:2/ct:r)

### Install Cloudflare Tunnel in WSL

In Ubuntu, install `cloudflared` using Cloudflare’s official Linux installation instructions, then verify:

```bash
cloudflared --version
```

Authenticate:

```bash
cloudflared tunnel login
```

A browser window opens. Log in to Cloudflare and select the zone that owns your domain, such as `jesspete.shop`.

### Reuse an existing tunnel

Your supplied skill describes an existing tunnel called `baking`; first verify whether it exists on this WSL machine:

```bash
cloudflared tunnel list
```

If `baking` is listed and connected, reuse it. If this is a different Windows/WSL machine, either install the existing tunnel credentials/config securely or create a separate tunnel—for example, `maison-windows`—rather than copying credentials casually between systems.

To create a new tunnel:

```bash
cloudflared tunnel create maison-windows
cloudflared tunnel list
```

Record the generated tunnel UUID.

### Add the DNS route

For an existing tunnel named `baking`:

```bash
cloudflared tunnel route dns baking maison.jesspete.shop
```

For the new tunnel:

```bash
cloudflared tunnel route dns maison-windows maison.jesspete.shop
```

This creates the Cloudflare DNS route for the hostname. Your tunnel skill uses exactly this route-creation pattern and records a CNAME to the tunnel ID. [mybtoys](https://mybtoys.com/shop/fluffy-doos-dash/?bvstate=pg:2/ct:r)

### Create tunnel configuration

Create the configuration folder:

```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

For the existing `baking` tunnel, use this structure:

```yaml
tunnel: 2784ef2b-a6b5-4c29-b1e5-5beaea4b5fd2
credentials-file: /home/YOUR_LINUX_USERNAME/.cloudflared/2784ef2b-a6b5-4c29-b1e5-5beaea4b5fd2.json

ingress:
  - hostname: maison.jesspete.shop
    service: http://127.0.0.1:3000
  - service: http_status:404
```

Replace `YOUR_LINUX_USERNAME` with the username displayed by:

```bash
whoami
```

For a newly created tunnel, use its actual tunnel UUID and its matching credential JSON filename.

If you already have other hostname rules, add the Maison rule **before** the final catch-all rule:

```yaml
  - service: http_status:404
```

The catch-all must remain last because Cloudflare Tunnel processes ingress rules in order. [mybtoys](https://mybtoys.com/shop/fluffy-doos-dash/?bvstate=pg:2/ct:r)

Validate the configuration:

```bash
cloudflared tunnel ingress validate
cloudflared tunnel ingress rule https://maison.jesspete.shop
```

### Run the tunnel for a first test

Start it manually:

```bash
cloudflared tunnel run baking
```

Or, for a separately named tunnel:

```bash
cloudflared tunnel run maison-windows
```

In another terminal:

```bash
curl -I https://maison.jesspete.shop
```

Open `https://maison.jesspete.shop` from a phone on mobile data, not your home Wi-Fi. This proves the public path works independently of your LAN.

### Run Cloudflare Tunnel automatically

Create a systemd user service:

```bash
mkdir -p ~/.config/systemd/user
nano ~/.config/systemd/user/cloudflared-maison.service
```

For the existing `baking` tunnel, paste:

```ini
[Unit]
Description=Cloudflare Tunnel for Maison
After=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/cloudflared tunnel --config /home/YOUR_LINUX_USERNAME/.cloudflared/config.yml run baking
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

Find the actual binary location and substitute it if different:

```bash
which cloudflared
```

Then enable and start the service:

```bash
systemctl --user daemon-reload
systemctl --user enable --now cloudflared-maison.service
systemctl --user status cloudflared-maison.service
```

Keep it running after logout:

```bash
loginctl enable-linger $USER
```

View logs:

```bash
journalctl --user -u cloudflared-maison.service -n 50 --no-pager
```

Your tunnel runbook uses the same systemd user-service approach, status checks, restart operation, logs, and `loginctl enable-linger` remediation for background persistence. [mybtoys](https://mybtoys.com/shop/fluffy-doos-dash/?bvstate=pg:2/ct:r)

## Secure the public deployment

### Apply these before real sales

- Use a dedicated production Cloudflare hostname, never a temporary development URL.
- Set `BETTER_AUTH_URL` to the exact HTTPS public hostname.
- Use Stripe live keys only after every checkout and webhook scenario passes in Stripe test mode.
- Configure Stripe’s public webhook endpoint as `https://maison.jesspete.shop/api/webhooks/stripe`; use the matching signing secret in `STRIPE_WEBHOOK_SECRET`. The repository identifies this endpoint and provides local Stripe CLI forwarding for development. [github](https://github.com/tanordheim)
- Set up Sanity’s webhook to `https://maison.jesspete.shop/api/webhooks/sanity` with the matching webhook secret if CMS-driven content is enabled. [github](https://github.com/tanordheim)
- Keep Postgres and Redis unexposed—no public `5432` or `6379` port mappings.
- Put Cloudflare Access in front of admin, preview, and staging sites. Do not place a public customer storefront behind an Access policy unless customers are meant to authenticate through it.
- Turn on Cloudflare WAF/rate-limit rules and bot protection appropriate to your plan.
- Use automatic Windows updates, WSL updates, Ubuntu security updates, and Docker image rebuilds.
- Back up the PostgreSQL volume and `.env.local` securely; test restoration, not just backup creation.

The repository says it includes CSP, rate limiting, signed webhooks, idempotent payment/inventory mutations, RBAC, audit logging, and an eight-gate CI target; validate those controls in your own running deployment rather than assuming they are active merely because they are documented. [github](https://github.com/tanordheim)

## Operating commands

### Start, stop, update

```bash
cd ~/projects/maison

# Start
docker compose -f docker-compose.yml -f compose.selfhost.yml up -d

# Stop, preserving database data
docker compose -f docker-compose.yml -f compose.selfhost.yml down

# See running services
docker compose -f docker-compose.yml -f compose.selfhost.yml ps

# Follow website logs
docker logs -f maison_web

# Pull newer source code
git pull origin main

# Rebuild and restart website after code changes
docker compose -f docker-compose.yml -f compose.selfhost.yml up -d --build
```

Run database migrations when the project update includes them:

```bash
pnpm db:migrate
```

Use the direct, unpooled database URL for that migration operation. [github](https://github.com/tanordheim)

### Health checks

```bash
curl -I http://127.0.0.1:3000
curl -I https://maison.jesspete.shop
docker compose ps
cloudflared tunnel info baking
systemctl --user status cloudflared-maison.service
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `wslc` is not recognized | WSL is outdated or container feature is unavailable | Run `wsl --update`, restart Windows, then retry; the current Microsoft documentation describes `wslc.exe` as built in.  [github](https://github.com/maisonsmd) |
| `docker: permission denied` | Linux user not in Docker group | Run `sudo usermod -aG docker $USER`, then close/reopen Ubuntu |
| `pnpm install` fails | Node/pnpm version mismatch or registry issue | Check `node --version` is 22+ and pnpm is 11.17.0; the repo notes transient `ERR_PNPM_NO_MATCHING_VERSION` can occur during registry propagation.  [github](https://github.com/tanordheim) |
| `db:migrate` reports prepared-statement problems | Pooled DB URL used for migrations | Set `DATABASE_URL_UNPOOLED` to a direct connection URL.  [github](https://github.com/tanordheim) |
| Website works locally but public hostname shows a 502/connection error | Web container is down or ingress target/port is wrong | Run `curl -I http://127.0.0.1:3000`, inspect `docker logs maison_web`, and confirm tunnel config points to `http://127.0.0.1:3000`.  [mybtoys](https://mybtoys.com/shop/fluffy-doos-dash/?bvstate=pg:2/ct:r) |
| Cloudflare hostname does not resolve | DNS route was not created or has not propagated | Run `cloudflared tunnel route dns <tunnel> <hostname>`, then check `cloudflared tunnel info <tunnel>`.  [mybtoys](https://mybtoys.com/shop/fluffy-doos-dash/?bvstate=pg:2/ct:r) |
| Public site fails after sign-in | Auth URL still points to localhost | Set `BETTER_AUTH_URL=https://your-public-hostname` and rebuild/restart.  [github](https://github.com/tanordheim) |
| Stripe webhook returns 400 | Wrong webhook signing secret | Confirm `STRIPE_WEBHOOK_SECRET` matches the Stripe endpoint; for local testing use Stripe CLI forwarding as documented by the repo.  [github](https://github.com/tanordheim) |
| Tunnel config edit does nothing | Tunnel service was not restarted | Run `systemctl --user restart cloudflared-maison.service`, then inspect its logs.  [mybtoys](https://mybtoys.com/shop/fluffy-doos-dash/?bvstate=pg:2/ct:r) |
| Site disappears after Windows reboot | Docker/tunnel did not resume | Check Docker, `systemctl --user status cloudflared-maison.service`, and ensure `loginctl enable-linger $USER` was run.  [mybtoys](https://mybtoys.com/shop/fluffy-doos-dash/?bvstate=pg:2/ct:r) |

---

https://www.perplexity.ai/search/6d7dbc2a-02e8-4075-9362-04e6c739156d 

# Hosting on EC2 with Caddy

Deploys the whole portfolio to a single EC2 host, served by Caddy at
**https://sample-1.exostech.pro** with an automatically issued Let's Encrypt certificate.

```bash
./deploy/ec2/deploy.sh
```

That is the entire operation. It is idempotent — run it again for every update.

---

## ⚠️ One manual step: DNS

Caddy gets its certificate through the ACME **HTTP-01** challenge, which requires Let's
Encrypt to reach this host *by name*. That needs a DNS record only you can create:

```
sample-1.exostech.pro.   A   18.226.86.97
```

Until that record exists, `deploy.sh` still deploys and Caddy still serves the site — it
just cannot get a certificate, so it retries in the background (every 60s, for up to 30
days). **HTTPS starts working on its own within about a minute of the record propagating.
No redeploy is needed.**

The script tells you which state you are in on every run:

```
dns    sample-1.exostech.pro does not resolve — no A record yet
```
```
dns    sample-1.exostech.pro → 18.226.86.97
```

Also confirm the EC2 **security group** allows inbound **80** and **443** from anywhere.
Port 80 is not optional — it carries the ACME challenge and the HTTP→HTTPS redirect.

---

## What it does

| Step | Detail |
| --- | --- |
| Build | Rebuilds `dist/` with `SITE_ORIGIN=https://sample-1.exostech.pro` so canonical tags, Open Graph URLs and `sitemap.xml` carry the real domain, then runs `verify.js` |
| Install | Installs Caddy from its official apt repository if not already present |
| Upload | `rsync --delete` to `/var/www/sample-1.exostech.pro`, staged through `/tmp` then moved into place as `caddy:caddy` |
| Configure | Renders [`Caddyfile`](Caddyfile), validates it *before* reloading, then reloads |
| Verify | Probes 9 routes and the HTTP→HTTPS redirect; exits non-zero if any fail |

### Why the build runs by default

The committed `dist/` is generated with a placeholder origin (`example.com`). Shipping it
unchanged produces a site that works but advertises the wrong canonical URLs to search
engines. Rebuilding is therefore the default; pass `SKIP_BUILD=1` to ship `dist/` as-is.

### Clean URLs

Every page is a directory containing `index.html` — 54 of them. The `try_files` directive
resolves `/aurelia/rooms/` → `/aurelia/rooms/index.html`, and also handles the
extensionless form a visitor might type. This is the detail that breaks most static hosts;
here it is one line.

---

## Options

```bash
SITE_DOMAIN=other.exostech.pro ./deploy/ec2/deploy.sh   # different hostname
TLS_EMAIL=you@example.com      ./deploy/ec2/deploy.sh   # ACME expiry notices
SKIP_BUILD=1                   ./deploy/ec2/deploy.sh   # ship committed dist/
DRY_RUN=1                      ./deploy/ec2/deploy.sh   # show transfers, change nothing
SSH_HOST=ubuntu@1.2.3.4         ./deploy/ec2/deploy.sh   # a different host
SSH_KEY=~/.ssh/your-key.pem    ./deploy/ec2/deploy.sh   # only if ssh needs telling
```

Setting `TLS_EMAIL` is worth doing for a site you intend to keep: it is how Let's Encrypt
warns you if renewal ever stops working.

---

## Verifying after DNS is live

```bash
curl -sI https://sample-1.exostech.pro/              | head -1   # 200
curl -sI https://sample-1.exostech.pro/aurelia/rooms/ | head -1   # 200
curl -sI https://sample-1.exostech.pro/nope/          | head -1   # 404
curl -sI http://sample-1.exostech.pro/                | head -1   # 308 → https
```

Check the certificate itself:

```bash
echo | openssl s_client -connect sample-1.exostech.pro:443 \
  -servername sample-1.exostech.pro 2>/dev/null \
  | openssl x509 -noout -issuer -dates
```

### If HTTPS is not working

```bash
ssh ubuntu@18.226.86.97 \
  'sudo journalctl -u caddy -n 50 --no-pager | grep -Ei "acme|cert|error"'
```

`NXDOMAIN` in that output means DNS still has not propagated — the record is missing or
pointing elsewhere. Anything mentioning `timeout` or `connection refused` on the challenge
usually means port 80 is blocked by the security group.

---

## Operating it

```bash
sudo systemctl status caddy            # is it running
sudo systemctl reload caddy            # apply a hand-edited config
sudo tail -f /var/log/caddy/access.log # requests
cat /etc/caddy/Caddyfile               # the deployed config
```

Certificates and ACME state live in `/var/lib/caddy/.local/share/caddy`. Renewal is
automatic; there is no cron job to set up.

> **Note:** run `caddy validate` as the `caddy` user, not root — as root it creates
> `/var/log/caddy/access.log` owned by `root:root`, and the service then fails to start
> with a bare `permission denied`. `deploy.sh` re-asserts ownership after validating for
> exactly this reason.

---

## Costs

The site is ~1.4 MB of static files with no runtime, no database and no build step on the
host. It consumes essentially nothing beyond the instance itself, and Let's Encrypt
certificates are free.

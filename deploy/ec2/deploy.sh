#!/usr/bin/env bash
#
# Deploy dist/ to an EC2 host and serve it over HTTPS with Caddy.
#
#   ./deploy/ec2/deploy.sh
#
# Environment overrides:
#   SITE_DOMAIN=sample-1.exostech.pro   hostname Caddy serves and gets a cert for
#   SSH_HOST=ubuntu@18.226.86.97       target host
#   SSH_KEY=~/.ssh/whatever.pem        identity file, if ssh needs telling
#   TLS_EMAIL=you@example.com          ACME contact for expiry notices
#   SKIP_BUILD=1                       ship the committed dist/ as-is
#   DRY_RUN=1                          show what would transfer, change nothing
#
# Requires ssh + rsync locally. Everything needed on the host (Caddy) is
# installed by this script; the site itself is static, so no runtime is needed.

set -euo pipefail

SITE_DOMAIN="${SITE_DOMAIN:-sample-1.exostech.pro}"
SSH_HOST="${SSH_HOST:-ubuntu@18.226.86.97}"
# No default identity file on purpose.
#
# This used to default to a specific .pem belonging to an unrelated project,
# which meant the script asserted a filename it had no way to know and failed
# for anyone whose key is named anything else. Left empty, ssh resolves the
# identity the way it normally does — ~/.ssh/config, a loaded agent, the default
# id_* files — which is already correct for anyone who can reach the host at
# all. Set SSH_KEY only when ssh needs telling.
SSH_KEY="${SSH_KEY:-}"
TLS_EMAIL="${TLS_EMAIL:-}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DIST="$ROOT/dist"
SITE_ROOT="/var/www/${SITE_DOMAIN}"

# An `if` rather than `[[ ... ]] && ...`: under `set -e` the short form is only
# safe while another command follows it, which is the kind of thing a later edit
# breaks silently.
SSH_OPTS=(-o StrictHostKeyChecking=accept-new)
if [[ -n "$SSH_KEY" ]]; then
  SSH_OPTS=(-i "$SSH_KEY" "${SSH_OPTS[@]}")
fi

SSH=(ssh "${SSH_OPTS[@]}" -o ConnectTimeout=15 "$SSH_HOST")

# rsync takes its transport as one string rather than an array.
RSYNC_SSH="ssh ${SSH_KEY:+-i $SSH_KEY} -o StrictHostKeyChecking=accept-new"

say() { printf '\n\033[1m→ %s\033[0m\n' "$*"; }

# ── Build ─────────────────────────────────────────────────────────────────────
# The committed dist/ is built with a placeholder origin, so canonical tags,
# Open Graph URLs and sitemap.xml would advertise example.com. Rebuilding with
# the real origin is the difference between a correct deploy and a subtly broken
# one, so it is the default rather than an opt-in.
if [[ -z "${SKIP_BUILD:-}" ]]; then
  say "Building for https://${SITE_DOMAIN}"
  ( cd "$ROOT" && SITE_ORIGIN="https://${SITE_DOMAIN}" BASE_PATH=/ node build.js && node verify.js )
else
  say "Skipping build (SKIP_BUILD set) — shipping committed dist/"
fi

[[ -d "$DIST" ]] || { echo "dist/ not found — run: node build.js" >&2; exit 1; }

# ── Preflight ─────────────────────────────────────────────────────────────────
say "Checking connectivity and DNS"

"${SSH[@]}" true || {
  echo "Cannot reach ${SSH_HOST}${SSH_KEY:+ with key $SSH_KEY}" >&2
  if [[ -z "$SSH_KEY" ]]; then
    echo "  ssh used its own default identities — set SSH_KEY to name one." >&2
  fi
  exit 1
}
echo "  ssh    ${SSH_HOST} reachable"

# Caddy obtains certificates over the ACME HTTP-01 challenge, which requires
# Let's Encrypt to reach this host at $SITE_DOMAIN on port 80. If DNS does not
# point here yet the deploy still proceeds — the site is served over HTTP and
# Caddy retries issuance on its own, so HTTPS lights up when DNS lands without
# anyone re-running this script.
HOST_IP="${SSH_HOST##*@}"
RESOLVED="$(dig +short "$SITE_DOMAIN" A 2>/dev/null | tail -1)"
TLS_READY=1
if [[ -z "$RESOLVED" ]]; then
  echo "  dns    ${SITE_DOMAIN} does not resolve — no A record yet"
  TLS_READY=0
elif [[ "$RESOLVED" != "$HOST_IP" ]]; then
  echo "  dns    ${SITE_DOMAIN} resolves to ${RESOLVED}, not ${HOST_IP}"
  TLS_READY=0
else
  echo "  dns    ${SITE_DOMAIN} → ${HOST_IP}"
fi

if [[ "$TLS_READY" -eq 0 ]]; then
  cat <<EOF

  ⚠  TLS will not be issued yet. Add this DNS record:

         ${SITE_DOMAIN}.   A   ${HOST_IP}

     The site deploys now and is reachable over HTTP. Caddy keeps retrying,
     so HTTPS starts working within ~a minute of the record propagating.
EOF
fi

if [[ -n "${DRY_RUN:-}" ]]; then
  say "Dry run — files that would transfer"
  rsync -avn --delete -e "$RSYNC_SSH" \
    "$DIST/" "${SSH_HOST}:/tmp/webport-dryrun/"
  echo; echo "Dry run complete — nothing on the host was changed."
  exit 0
fi

# ── Install Caddy ─────────────────────────────────────────────────────────────
say "Ensuring Caddy is installed"
"${SSH[@]}" 'bash -se' <<'REMOTE'
set -euo pipefail
if command -v caddy >/dev/null 2>&1; then
  echo "  caddy already present: $(caddy version | head -1)"
else
  echo "  installing caddy from the official apt repository"
  sudo apt-get update -qq
  sudo apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https curl >/dev/null
  curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key \
    | sudo gpg --batch --yes --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt \
    | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo apt-get update -qq
  sudo apt-get install -y -qq caddy >/dev/null
  echo "  installed: $(caddy version | head -1)"
fi
sudo mkdir -p /var/log/caddy
# Ownership is applied to the directory *and* anything already in it. A root-owned
# access.log left behind by an earlier run (caddy validate as root creates one)
# makes the service fail at startup with a bare "permission denied".
sudo chown -R caddy:caddy /var/log/caddy
REMOTE

# ── Upload ────────────────────────────────────────────────────────────────────
# Staged through a directory the ssh user owns, then moved into place, because
# rsync over ssh cannot write to /var/www directly without root.
say "Uploading dist/ to ${SITE_ROOT}"
"${SSH[@]}" "mkdir -p /tmp/webport-stage"
rsync -az --delete --info=stats1 \
  -e "$RSYNC_SSH" \
  "$DIST/" "${SSH_HOST}:/tmp/webport-stage/"

"${SSH[@]}" "bash -se" <<REMOTE
set -euo pipefail
sudo mkdir -p "${SITE_ROOT}"
sudo rsync -a --delete /tmp/webport-stage/ "${SITE_ROOT}/"
sudo chown -R caddy:caddy "${SITE_ROOT}"
sudo find "${SITE_ROOT}" -type d -exec chmod 755 {} +
sudo find "${SITE_ROOT}" -type f -exec chmod 644 {} +
echo "  \$(sudo find "${SITE_ROOT}" -name index.html | wc -l) pages in place"
REMOTE

# ── Configure Caddy ───────────────────────────────────────────────────────────
say "Writing Caddy configuration"

# The Caddyfile is templated locally so the host never needs the repo. Caddy's
# own {$VAR} substitution is avoided here because the values are known now and
# baking them in keeps the deployed config readable when debugging on the box.
CADDYFILE="$(sed -e "s|{\$SITE_DOMAIN}|${SITE_DOMAIN}|g" \
                 -e "s|{\$SITE_ROOT}|${SITE_ROOT}|g" \
                 "$ROOT/deploy/ec2/Caddyfile")"

if [[ -n "$TLS_EMAIL" ]]; then
  CADDYFILE="{
	email ${TLS_EMAIL}
}

${CADDYFILE}"
fi

printf '%s\n' "$CADDYFILE" | "${SSH[@]}" "sudo tee /etc/caddy/Caddyfile >/dev/null"

"${SSH[@]}" 'bash -se' <<'REMOTE'
set -euo pipefail
# Fail before reloading rather than after: a bad config would otherwise take the
# running site down.
sudo caddy validate --config /etc/caddy/Caddyfile 2>&1 | sed 's/^/  /'

# validate runs as root and opens the configured log file, creating it as
# root:root 0600. The caddy service user then cannot write to it and the unit
# dies at startup. Re-assert ownership after validating, not just at install.
sudo mkdir -p /var/log/caddy
sudo chown -R caddy:caddy /var/log/caddy

sudo systemctl enable --now caddy >/dev/null 2>&1
sudo systemctl reload caddy 2>/dev/null || sudo systemctl restart caddy
sleep 2
systemctl is-active --quiet caddy && echo "  caddy is running" || {
  echo "  caddy failed to start:"; sudo journalctl -u caddy -n 20 --no-pager; exit 1;
}
REMOTE

# ── Verify ────────────────────────────────────────────────────────────────────
# Caddy redirects all HTTP to HTTPS, so probing http://127.0.0.1 only proves the
# redirect exists — every path returns 308 whether or not the content is there.
# Before a certificate is issued HTTPS cannot be probed either. So routing is
# exercised against the deployed root through a throwaway plain-HTTP server on
# :8080 using the same try_files/file_server/404 rules as the live vhost.
say "Verifying content and routing"
"${SSH[@]}" "bash -se" <<REMOTE
set -uo pipefail
sudo pkill -f verify.Caddyfile >/dev/null 2>&1; sleep 1
sudo tee /tmp/verify.Caddyfile >/dev/null <<'CFG'
{
	admin off
	auto_https off
}
:8080 {
	root * ${SITE_ROOT}
	try_files {path} {path}/index.html {path}.html
	file_server
	handle_errors {
		@404 expression {err.status_code} == 404
		rewrite @404 /404/index.html
		file_server
	}
}
CFG
sudo nohup caddy run --config /tmp/verify.Caddyfile --adapter caddyfile \\
  >/tmp/verify.log 2>&1 </dev/null & disown
sleep 4

check() {
  local path="\$1" expect="\$2"
  local code
  code=\$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:8080\$path")
  if [[ "\$code" == "\$expect" ]]; then
    printf '  %-40s %s\n' "\$path" "\$code ✓"
  else
    printf '  %-40s %s (expected %s) ✗\n' "\$path" "\$code" "\$expect"
    return 1
  fi
}
rc=0
check /                              200 || rc=1
check /aurelia/                      200 || rc=1
check /aurelia/rooms/                200 || rc=1
check /northwind/                    200 || rc=1
check /forma/shop/prism-vase/        200 || rc=1
check /vestra/fit/                   200 || rc=1
check /lab/renderer/                 200 || rc=1
check /work/vestra/                  200 || rc=1
check /shared/reset.css              200 || rc=1
check /assets/hub.css                200 || rc=1
check /vestra/assets/vestra.css      200 || rc=1
check /lab/assets/lab.css            200 || rc=1
check /sitemap.xml                   200 || rc=1
check /robots.txt                    200 || rc=1
# Extensionless, to prove try_files handles the form a visitor types.
check /aurelia/rooms                 200 || rc=1
check /definitely-not-a-page/        404 || rc=1

sudo pkill -f verify.Caddyfile >/dev/null 2>&1
sudo rm -f /tmp/verify.Caddyfile /tmp/verify.log

# Confirm the real vhost is up and redirecting to HTTPS as configured.
loc=\$(curl -s -o /dev/null -w '%{redirect_url}' -H "Host: ${SITE_DOMAIN}" http://127.0.0.1/)
printf '  %-40s %s\n' "http → https redirect" "\${loc:-NONE ✗}"
[[ -n "\$loc" ]] || rc=1

exit \$rc
REMOTE

say "Done"
if [[ "$TLS_READY" -eq 1 ]]; then
  echo "  https://${SITE_DOMAIN}"
  echo
  echo "  If this is the first deploy, give Caddy a few seconds to complete the"
  echo "  ACME handshake, then: curl -sI https://${SITE_DOMAIN} | head -1"
else
  echo "  Serving over HTTP at http://${HOST_IP} (Host: ${SITE_DOMAIN})"
  echo "  Add the A record above and HTTPS turns on by itself."
fi

#!/usr/bin/env bash
#
# Deploy dist/ to S3 and invalidate CloudFront.
#
#   BUCKET=my-bucket DISTRIBUTION_ID=E123ABC ./deploy/aws/deploy.sh
#
# Optional:
#   SITE_ORIGIN=https://example.com   rebuild with the real canonical origin first
#   PROFILE=work                      use a named AWS CLI profile
#   DRY_RUN=1                         show what would change, upload nothing
#
# Requires only the AWS CLI. The site itself has no build dependencies.

set -euo pipefail

: "${BUCKET:?Set BUCKET to the target S3 bucket name}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DIST="$ROOT/dist"

AWS=(aws)
[[ -n "${PROFILE:-}" ]] && AWS+=(--profile "$PROFILE")

SYNC_FLAGS=(--no-progress)
[[ -n "${DRY_RUN:-}" ]] && SYNC_FLAGS+=(--dryrun)

# ── Rebuild if a real origin was supplied ──────────────────────────────────────
# The committed dist/ is built with a placeholder origin, so canonical tags and
# sitemap.xml would advertise example.com. Passing SITE_ORIGIN fixes that.
if [[ -n "${SITE_ORIGIN:-}" ]]; then
  echo "→ Rebuilding for ${SITE_ORIGIN}"
  ( cd "$ROOT" && SITE_ORIGIN="$SITE_ORIGIN" BASE_PATH=/ node build.js && node verify.js )
fi

[[ -d "$DIST" ]] || { echo "dist/ not found — run: node build.js" >&2; exit 1; }

echo "→ Uploading assets to s3://${BUCKET}"

# Assets first, HTML last: a visitor mid-deploy should never receive new HTML
# that references a stylesheet which has not landed yet.
"${AWS[@]}" s3 sync "$DIST" "s3://${BUCKET}" "${SYNC_FLAGS[@]}" \
  --exclude "*.html" \
  --exclude "*.xml" \
  --exclude "*.txt" \
  --exclude ".nojekyll" \
  --cache-control "public, max-age=3600"

echo "→ Uploading HTML and crawl files"

# Nothing is content-hashed, so HTML must revalidate every time or a deploy is
# invisible until the browser cache expires.
"${AWS[@]}" s3 sync "$DIST" "s3://${BUCKET}" "${SYNC_FLAGS[@]}" \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html; charset=utf-8"

"${AWS[@]}" s3 cp "$DIST/sitemap.xml" "s3://${BUCKET}/sitemap.xml" \
  --cache-control "public, max-age=3600" \
  --content-type "application/xml; charset=utf-8" ${DRY_RUN:+--dryrun}

"${AWS[@]}" s3 cp "$DIST/robots.txt" "s3://${BUCKET}/robots.txt" \
  --cache-control "public, max-age=3600" \
  --content-type "text/plain; charset=utf-8" ${DRY_RUN:+--dryrun}

# Delete removed files only after everything new is in place.
echo "→ Removing files no longer in the build"
"${AWS[@]}" s3 sync "$DIST" "s3://${BUCKET}" "${SYNC_FLAGS[@]}" --delete --exclude "*" \
  --include "*" --size-only >/dev/null

if [[ -n "$DISTRIBUTION_ID" && -z "${DRY_RUN:-}" ]]; then
  echo "→ Invalidating CloudFront"
  "${AWS[@]}" cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' --output text
else
  echo "→ Skipping CloudFront invalidation (set DISTRIBUTION_ID to enable)"
fi

echo "✓ Done"

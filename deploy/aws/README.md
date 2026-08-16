# Hosting on AWS

The site is static files with no server, so any of these work. Read the trap first — it
catches almost everyone.

---

## ⚠️ The one thing that will break it

This site uses **clean URLs**: `/aurelia/rooms/` is a real directory containing
`index.html`. There are 54 such directories.

- An S3 **website endpoint** resolves those automatically. ✅
- An S3 **REST endpoint** — what you get with a private bucket and Origin Access Control,
  the modern recommended setup — **does not**. ❌

CloudFront's *Default root object* setting only applies to the distribution root, never to
subdirectories. So with a naïve CloudFront + private S3 setup, the home page loads fine and
**every interior page returns `AccessDenied`** — which reads as a permissions problem and
sends people off editing bucket policies for an hour. It is a routing problem.

`cloudfront-rewrite.js` in this directory fixes it. Its logic is unit-tested against this
site's real paths.

---

## Option A — S3 + CloudFront + OAC (recommended)

Private bucket, HTTPS, custom domain, CDN caching.

### 1. Bucket

Create a bucket. **Do not** enable static website hosting, and leave Block Public Access
fully on — CloudFront reads it privately.

### 2. Distribution

Create a CloudFront distribution with:

| Setting | Value |
| --- | --- |
| Origin | the S3 bucket (REST endpoint, not the website endpoint) |
| Origin access | **Origin access control**, signing enabled |
| Viewer protocol policy | Redirect HTTP to HTTPS |
| Default root object | `index.html` |
| Compress objects automatically | Yes |

### 3. Bucket policy

CloudFront gives you this to paste when you create the OAC. It should look like:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DIST_ID"
        }
      }
    }
  ]
}
```

### 4. Attach the rewrite function — do not skip this

CloudFront → **Functions** → Create function, runtime **cloudfront-js-2.0**. Paste
[`cloudfront-rewrite.js`](cloudfront-rewrite.js), publish, then associate it with the
default behaviour on **Viewer request**.

### 5. 404 page

Distribution → **Error pages** → Create custom error response:

| Field | Value |
| --- | --- |
| HTTP error code | 403: Forbidden |
| Customise error response | Yes |
| Response page path | `/404/index.html` |
| HTTP response code | 404 |

Add the same for 404: Not Found. (A private S3 origin returns **403** for a missing key,
not 404 — so mapping only 404 leaves genuine typos showing an AWS error page.)

### 6. Deploy

```bash
BUCKET=your-bucket \
DISTRIBUTION_ID=E1234567890ABC \
SITE_ORIGIN=https://yourdomain.com \
  ./deploy/aws/deploy.sh
```

`SITE_ORIGIN` rebuilds first so canonical tags and `sitemap.xml` carry the real domain —
the committed build uses a placeholder. Add `DRY_RUN=1` to see what would change.

---

## Option B — S3 website endpoint only

Simplest possible, and clean URLs work with no function. The catch: website endpoints are
**HTTP only**, so this suits an internal or temporary host rather than a public site.

1. Bucket → Properties → **Static website hosting: Enable**
2. Index document `index.html`, error document `404/index.html`
3. Allow public reads, then:

```bash
aws s3 sync dist/ s3://your-bucket/ --delete
```

To put HTTPS in front of it later, add CloudFront using the **website endpoint** as a
*custom origin* (not an S3 origin). Clean URLs keep working and no function is needed —
the trade is that the bucket has to stay publicly readable.

---

## Option C — AWS Amplify Hosting

The least work: connects to the GitHub repo, gives HTTPS and a domain, and handles clean
URLs itself.

- Build command: *(leave empty)*
- Output directory: `dist`

Amplify redeploys on push. Nothing needs installing because the repo has no dependencies.

---

## Costs

The whole site is **~1.8 MB**. On S3 + CloudFront that is a few cents a month at low
traffic, and comfortably inside the CloudFront free tier for a portfolio. There is no
compute, no database and nothing that scales with visitors beyond bandwidth.

## Verifying the deploy

After going live, check an **interior** page rather than the home page — that is what the
rewrite function affects:

```bash
curl -sI https://yourdomain.com/aurelia/rooms/     | head -1   # expect 200
curl -sI https://yourdomain.com/forma/shop/prism-vase/ | head -1   # expect 200
curl -sI https://yourdomain.com/definitely-not-a-page/ | head -1   # expect 404
```

If the first two return 403, the CloudFront Function is not attached to the viewer request.

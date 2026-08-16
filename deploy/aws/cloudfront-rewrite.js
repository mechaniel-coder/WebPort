/**
 * CloudFront Function — viewer request. Runtime: cloudfront-js-2.0.
 *
 * WHY THIS IS REQUIRED
 * ────────────────────
 * This site uses clean URLs: /aurelia/rooms/ is a real directory containing
 * index.html. An S3 *website endpoint* resolves that automatically. An S3
 * *REST endpoint* — which is what you get with Origin Access Control and a
 * private bucket, the recommended modern setup — does not.
 *
 * CloudFront's "Default root object" only applies to the root of the
 * distribution, never to subdirectories. Without this function, the home page
 * loads and every single interior page returns AccessDenied. That is the most
 * common way a static site breaks on AWS, and it looks like a permissions
 * problem rather than a routing one.
 *
 * This rewrites:
 *   /aurelia/rooms/          →  /aurelia/rooms/index.html
 *   /aurelia/rooms           →  /aurelia/rooms/index.html
 *   /shared/reset.css        →  unchanged
 *   /forma/assets/render.js  →  unchanged
 *
 * Deliberately written in ES5-safe syntax; CloudFront Functions are not Node.
 */
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Already a directory path — append the index document.
  if (uri.charAt(uri.length - 1) === '/') {
    request.uri = uri + 'index.html';
    return request;
  }

  // No dot after the final slash means there is no file extension, so this is a
  // directory reference missing its trailing slash. Anything with an extension
  // (.css, .js, .svg, .xml, .txt) is a real file and is left alone.
  if (uri.lastIndexOf('.') < uri.lastIndexOf('/')) {
    request.uri = uri + '/index.html';
  }

  return request;
}

/**
 * CloudFront Function — viewer request. Runtime: cloudfront-js-2.0.
 *
 * Redirects www.exostech.pro → exostech.pro with a 301.
 *
 * WHY
 * ───
 * Canonical URLs, Open Graph tags and sitemap.xml are all built for the apex
 * (https://exostech.pro). If www serves the same content instead of redirecting,
 * every page exists at two addresses: search engines split ranking signals
 * between them, and social shares of the www version are attributed separately.
 *
 * Attach this to the *www* behaviour only. If you have a single distribution
 * serving both names, attach this and the rewrite function to the same viewer
 * request — combine them into one function rather than chaining, since only one
 * function can be associated per event type.
 */
var APEX = 'exostech.pro';

function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : '';

  if (host.indexOf('www.') === 0) {
    var target = 'https://' + APEX + request.uri;

    // Preserve the query string, or a redirect drops filter state — the Forma
    // shop encodes its facets there.
    var query = [];
    for (var key in request.querystring) {
      query.push(key + '=' + request.querystring[key].value);
    }
    if (query.length) target += '?' + query.join('&');

    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: target } },
    };
  }

  return request;
}

const MAX_REDIRECTS = 5;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Expose-Headers': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

async function handleProxyRequest(request, targetUrl, iteration = 0) {
  // Handle redirect loops
  if (iteration > MAX_REDIRECTS) {
    return new Response('Too many redirects', { status: 418 });
  }

  // Clone headers for manipulation
  const headers = new Headers(request.headers);
  
  // Special header handling
  if (headers.has('X-Cookie')) {
    headers.set('Cookie', headers.get('X-Cookie'));
    headers.delete('X-Cookie');
  }

  // Security headers to remove
  const UNSAFE_HEADERS = [
    'host', 'content-length', 'content-security-policy',
    'referer-policy', 'expect-ct', 'x-frame-options'
  ];
  
  // Create safe request to target
  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: 'manual'
  });

  // Add default UA if missing
  if (!proxyRequest.headers.has('User-Agent')) {
    proxyRequest.headers.set(
      'User-Agent',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36'
    );
  }

  // Execute proxy request
  let response = await fetch(proxyRequest);

  // Handle redirects
  if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.has('location')) {
    const location = response.headers.get('location');
    const nextUrl = new URL(location, targetUrl);
    return handleProxyRequest(request, nextUrl, iteration + 1);
  }

  // Process response headers
  const responseHeaders = new Headers(response.headers);
  
  // Clean problematic headers
  UNSAFE_HEADERS.forEach(header => responseHeaders.delete(header));
  
  // Add CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    responseHeaders.set(key, value);
  });

  // Handle cookies
  if (responseHeaders.has('Set-Cookie')) {
    responseHeaders.set('X-Set-Cookie', responseHeaders.get('Set-Cookie'));
    responseHeaders.delete('Set-Cookie');
  }

  // Stream response with proper headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders
  });
}

function handleOptions() {
  return new Response(null, {
    headers: CORS_HEADERS
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // Remove leading /

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Validate path exists
    if (!path) {
      return new Response('URL path required\n\nUsage: /example.com/file.ext', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    try {
      // Parse target URL from path
      let targetUrl;
      if (/^https?:\/\//i.test(path)) {
        targetUrl = new URL(path);
      } else {
        targetUrl = new URL(`https://${path}`);
      }

      // Append original query parameters
      url.searchParams.forEach((value, key) => {
        targetUrl.searchParams.append(key, value);
      });

      // Validate protocol
      if (!['http:', 'https:'].includes(targetUrl.protocol)) {
        return new Response('Invalid protocol', { status: 400 });
      }

      // Process request
      return handleProxyRequest(request, targetUrl);
    } catch (err) {
      return new Response(`Error: ${err.message}`, { status: 500 });
    }
  }
};
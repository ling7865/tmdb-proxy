addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  let pathname = url.pathname;
  let targetUrl;

  // 支持完整 TMDB v3 API：自动加 /3/ 如果用户没加，或保留
  if (pathname.startsWith('/3/')) {
    targetUrl = 'https://api.themoviedb.org' + pathname + url.search;
  } else if (pathname.startsWith('/')) {
    // 如果用户请求 /discover/... 或 /trending/...，自动补 /3/
    targetUrl = 'https://api.themoviedb.org/3' + pathname + url.search;
  } else {
    return new Response(JSON.stringify({ success: false, status_code: 400, status_message: 'Invalid path' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 支持图片代理（可选增强）
  if (pathname.startsWith('/t/p/') || pathname.includes('/image/')) {
    targetUrl = 'https://image.tmdb.org' + pathname + url.search;
  }

  const headers = new Headers(request.headers);
  headers.delete('Host'); // 避免 Host 冲突

  // 如果 Worker 有 TMDB_API_KEY 环境变量，可注入（但你用 ?api_key=，所以可选）
  // const apiKey = TMDB_API_KEY; // 从 env
  // if (apiKey && !url.searchParams.has('api_key')) {
  //   targetUrl += (targetUrl.includes('?') ? '&' : '?') + `api_key=${apiKey}`;
  // }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      redirect: 'follow',
      body: request.body
    });

    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    return newResponse;
  } catch (e) {
    return new Response(JSON.stringify({ success: false, status_message: 'Proxy error: ' + e.message }), { status: 502 });
  }
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const TMDB_BASE = "https://api.themoviedb.org/3";

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const search = url.searchParams;
  if (path.startsWith("/api/3")) {
  path = path.replace("/api/3", "");
}

  // 处理 OPTIONS 跨域预检
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  // 处理图片路径 /image
  if (path.startsWith("/image/")) {
    const imagePath = path.replace("/image", "");
    const imageUrl = `https://image.tmdb.org${imagePath}?${url.searchParams}`;
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Image not found" }), {
        status: response.status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    return new Response(await response.arrayBuffer(), {
      status: response.status,
      headers: newHeaders,
    });
  }

  // 处理 API 路径
  let apiPath = path;

  // 如果带 /api/3 前缀，则删除
  if (apiPath.startsWith("/api/3")) {
    apiPath = apiPath.replace("/api/3", "");
  }

  // 构造目标 URL
  const targetUrl = `${TMDB_BASE}${apiPath}?${url.searchParams}`;

  // 原样转发到官方
  const apiResponse = await fetch(targetUrl, {
    method: request.method,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  });

  // 加上 CORS
  const headers = new Headers(apiResponse.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "*");

  return new Response(apiResponse.body, {
    status: apiResponse.status,
    headers,
  });
}

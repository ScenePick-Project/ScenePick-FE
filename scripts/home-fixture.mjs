import { createServer } from "node:http";
import { setTimeout } from "node:timers/promises";
import console from "node:console";

// Local HTTP boundary fixture only; never imported by the application.
let scenario = "empty";
let recommendationCalls = 0;
let requests = [];
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:4174");
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5174");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }
  if (url.pathname === "/viewport") {
    const width = url.searchParams.get("width") === "375" ? 375 : 1280;
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      `<html><head><title>Home viewport fixture</title></head><body><iframe title="Home ${width}px" src="http://127.0.0.1:5174/" width="${width}" height="812" style="border:0"></iframe></body></html>`,
    );
    return;
  }
  if (url.pathname === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ scenario, recommendationCalls, requests }));
    return;
  }
  if (url.pathname === "/scenario") {
    scenario = url.searchParams.get("name") || "empty";
    recommendationCalls = 0;
    requests = [];
    res.end(scenario);
    return;
  }
  console.log(req.method, url.pathname, scenario);
  requests.push(`${req.method} ${url.pathname}`);
  const reply = (result, status = 200) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        isSuccess: status === 200,
        code: `COMMON${status}`,
        message: "fixture",
        result,
      }),
    );
  };
  if (url.pathname === "/api/v1/user/me") {
    if (scenario === "auth-loading") await setTimeout(2000);
    reply(
      { userId: "home-fixture", role: "ROLE_USER" },
      scenario === "guest" ? 401 : scenario === "auth-error" ? 500 : 200,
    );
    return;
  }
  if (url.pathname === "/api/v1/home/recommendations") {
    recommendationCalls++;
    if (scenario === "loading") await setTimeout(2000);
    if (scenario === "unauthorized") {
      reply(null, 401);
      return;
    }
    if (
      scenario === "error" ||
      (scenario === "retry" && recommendationCalls === 1)
    ) {
      reply(null, 500);
      return;
    }
    const count = scenario === "empty" ? 0 : scenario === "three" ? 3 : 10;
    reply({
      recommendationType: "RANDOM",
      contentList: Array.from({ length: count }, (_, i) => ({
        contentId: 101 + i,
        title:
          i === 0
            ? "아주 긴 작품 제목도 카드 너비를 넘지 않고 표시됩니다"
            : `테스트 작품 ${i + 1}`,
        posterImageUrl: `http://127.0.0.1:4174/${scenario === "broken" ? "broken" : "poster"}/${i}`,
        contentType: i % 2 ? "TV" : "MOVIE",
      })),
    });
    return;
  }
  if (url.pathname.startsWith("/poster/")) {
    res.writeHead(200, { "Content-Type": "image/svg+xml" });
    res.end(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="#4338ca"/><text x="100" y="150" text-anchor="middle" fill="white" font-size="20">POSTER</text></svg>',
    );
    return;
  }
  reply(null, 404);
});
server.listen(4174, "127.0.0.1", () =>
  console.log("Home fixture: http://127.0.0.1:4174"),
);

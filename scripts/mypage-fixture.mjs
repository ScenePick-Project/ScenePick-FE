import { createServer } from "node:http";
import { setTimeout } from "node:timers/promises";
import console from "node:console";

// HTTP-only local fixture. The application always uses its real request/Query code.
let scenario = "populated",
  requests = [],
  failedNext = false,
  failedInitial = false,
  loggedOut = false;
let profile;
let deleted = new Set();
function reset(name) {
  deleted = new Set();
  scenario = name;
  requests = [];
  failedNext = false;
  failedInitial = false;
  loggedOut = false;
  profile = {
    userId: "mypage-fixture",
    nickname: name === "long" ? "아주긴닉네임".repeat(5) : "장면 수집가",
    bio:
      name === "long"
        ? "공백없는긴자기소개".repeat(40)
        : name === "empty"
          ? null
          : "좋아하는 작품의 순간을 간직합니다.",
    imageKey: null,
    imageUrl: name === "broken" ? "http://127.0.0.1:4180/missing.png" : null,
    followingCount: name === "empty" ? 0 : 2,
    followerCount: name === "empty" ? 0 : 3,
  };
}
reset(scenario);
const createdAt = "2026-10-05T10:00:00";
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:4180");
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5180");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PATCH, POST, DELETE, OPTIONS",
  );
  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }
  if (url.pathname === "/scenario") {
    reset(url.searchParams.get("name") || "populated");
    res.end(scenario);
    return;
  }
  if (url.pathname === "/status") {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ scenario, requests, profile }));
    return;
  }
  if (url.pathname === "/viewport") {
    const width = url.searchParams.get("width") === "375" ? 375 : 1280;
    res.setHeader("Content-Type", "text/html");
    res.end(
      '<html><head><title>MyPage viewport</title></head><body style="margin:0"><iframe title="MyPage ' +
        width +
        'px" src="http://127.0.0.1:5180/mypage" width="' +
        width +
        '" height="900" style="border:0"></iframe></body></html>',
    );
    return;
  }
  requests.push({
    method: req.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
  });
  const reply = (result, status = 200) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        isSuccess: status === 200,
        code: "COMMON" + status,
        message: "fixture",
        result,
      }),
    );
  };
  if (url.pathname === "/api/v1/user/me") {
    reply({
      userId: scenario === "guest" || loggedOut ? "" : profile.userId,
      role: "ROLE_USER",
    });
    return;
  }
  if (url.pathname === "/api/v1/user/logout") {
    if (scenario === "logout-error") reply(null, 500);
    else {
      loggedOut = true;
      reply(null);
    }
    return;
  }
  if (url.pathname === "/api/v1/home/recommendations") {
    reply({ recommendationType: "RANDOM", contentList: [] });
    return;
  }
  if (url.pathname.startsWith("/api/v1/me/")) {
    if (scenario === "expired") {
      reply(null, 401);
      return;
    }
    if (scenario === "banned") {
      reply(null, 403);
      return;
    }
    if (scenario === "loading") await setTimeout(1800);
    if (scenario === "error") {
      reply(null, 500);
      return;
    }
    if (
      scenario === "retry" &&
      !failedInitial &&
      url.pathname === "/api/v1/me/reviews"
    ) {
      failedInitial = true;
      reply(null, 500);
      return;
    }
    if (url.pathname === "/api/v1/me/profile") {
      if (req.method === "PATCH") {
        let data = "";
        for await (const chunk of req) data += chunk;
        const body = JSON.parse(data);
        requests.at(-1).body = body;
        if (scenario === "save-error") {
          reply(null, 500);
          return;
        }
        if (
          !body.nickname?.trim() ||
          body.nickname.length > 30 ||
          (body.bio?.length ?? 0) > 500
        ) {
          reply(null, 400);
          return;
        }
        profile = { ...profile, ...body };
        reply(null);
        return;
      }
      reply(profile);
      return;
    }
    if (url.pathname === "/api/v1/me/rating-statistics") {
      const counts =
        scenario === "empty"
          ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          : [0, 1, 0, 0, 0, 0, 0, 0, 1, 2];
      reply({
        totalCount: scenario === "empty" ? 0 : 4,
        buckets: counts.map((count, i) => ({ rating: (i + 1) / 2, count })),
      });
      return;
    }
    const endpoint = url.pathname.split("/").at(-1);
    const next =
      url.searchParams.has("cursorId") ||
      url.searchParams.has("cursorMomentId");
    if (scenario === "next-error" && next && !failedNext) {
      failedNext = true;
      reply(null, 500);
      return;
    }
    const ids = scenario === "empty" ? [] : next ? [1] : [3, 2];
    let items;
    if (endpoint === "reviews" || endpoint === "review-bookmarks")
      items = ids
        .filter((i) => !deleted.has(i))
        .map((i) => ({
          reviewId: i,
          contentId: 101,
          title: "테스트 작품 " + i,
          reviewBody: "간직하고 싶은 리뷰 " + i,
          rating: i === 2 ? null : 4.5,
          createdAt,
        }));
    else if (endpoint === "moments")
      items = ids.map((i) => ({
        momentId: i,
        contentId: 101,
        youtubeId: "dQw4w9WgXcQ",
        startTime: 30,
        endTime: 60,
        memo: "간직한 장면 " + i,
        createdAt,
        updatedAt: createdAt,
      }));
    else if (endpoint === "track-bookmarks")
      items = ids.map((i) => ({
        trackId: "track-" + i,
        trackName: "기억 속 노래 " + i,
        artist: "테스트 아티스트",
      }));
    else if (endpoint === "following" || endpoint === "followers")
      items = ids.map((i) => ({
        userId: "user-" + i,
        nickname: "이웃 수집가 " + i,
      }));
    else {
      reply(null, 404);
      return;
    }
    const hasNext = ids.length > 0 && !next;
    const nextCursor = hasNext
      ? endpoint === "moments"
        ? { createdAt, momentId: 2 }
        : { createdAt, id: 2 }
      : null;
    reply(
      endpoint === "moments"
        ? { momentList: items, nextCursor, hasNext }
        : { items, nextCursor, hasNext },
    );
    return;
  }
  if (url.pathname.startsWith("/api/v1/reviews/")) {
    const reviewId = Number(url.pathname.split("/").at(-1));
    if (req.method === "DELETE") {
      deleted.add(reviewId);
      reply(null);
      return;
    }
    reply({
      reviewId,
      contentId: 101,
      userId: profile.userId,
      reviewBody: "리뷰 상세 " + reviewId,
      isSpoiler: false,
      trackId: null,
      youtubeId: null,
      startTime: null,
      endTime: null,
      likeCount: 0,
      isLikedByCurrentUser: false,
      createdAt,
      rating: 4.5,
    });
    return;
  }
  reply(null, 404);
});
server.listen(4180, "127.0.0.1", () =>
  console.log("MyPage fixture http://127.0.0.1:4180"),
);

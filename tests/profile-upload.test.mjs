import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(
  new URL("../src/features/mypage/mypageApi.ts", import.meta.url),
  "utf8",
);
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
function api(request, fetch) {
  const context = {
    exports: {},
    require: (name) => (name.includes("request") ? { request } : {}),
    fetch,
    Error,
  };
  vm.runInNewContext(code, context);
  return context.exports.uploadProfileImage;
}
test("invalid images stop before requesting an upload URL", async () => {
  const upload = api(
    () => assert.fail("unexpected API request"),
    () => assert.fail("unexpected PUT"),
  );
  for (const file of [
    { type: "image/svg+xml", size: 1 },
    { type: "image/png", size: 0 },
    { type: "image/jpeg", size: 5 * 1024 * 1024 + 1 },
  ])
    await assert.rejects(upload(file), /5MB/);
});
test("uploads the binary with its MIME, no credentials, then returns only the key", async () => {
  const file = { type: "image/webp", size: 20 };
  const upload = api(
    async (config) => {
      assert.equal(config.url, "/s3/presigned/upload/PROFILES");
      assert.equal(config.body.contentType, file.type);
      assert.equal(config.body.fileName, "profile.webp");
      return {
        keyName: "profiles/owner/photo.webp",
        url: "https://example.test/upload",
      };
    },
    async (url, options) => {
      assert.equal(url, "https://example.test/upload");
      assert.equal(options.method, "PUT");
      assert.equal(options.body, file);
      assert.equal(options.credentials, "omit");
      assert.equal(options.headers["Content-Type"], file.type);
      return { ok: true };
    },
  );
  assert.equal(await upload(file), "profiles/owner/photo.webp");
});
test("failed S3 PUT never returns a profile key", async () => {
  const upload = api(
    async () => ({ keyName: "key", url: "https://example.test/upload" }),
    async () => ({ ok: false }),
  );
  await assert.rejects(upload({ type: "image/png", size: 1 }), /업로드에 실패/);
});

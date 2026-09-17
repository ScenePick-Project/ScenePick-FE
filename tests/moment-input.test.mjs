import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import process from "node:process";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = mkdtempSync(path.join(tmpdir(), "scenepick-moment-test-"));
after(() => {
  assert.equal(path.dirname(output), path.resolve(tmpdir()));
  assert.ok(path.basename(output).startsWith("scenepick-moment-test-"));
  rmSync(output, { recursive: true, force: true });
});
execFileSync(process.execPath, [
  require.resolve("typescript/bin/tsc"),
  "--target",
  "ES2022",
  "--module",
  "commonjs",
  "--skipLibCheck",
  "--rootDir",
  path.join(root, "src"),
  "--outDir",
  output,
  path.join(root, "src/features/moment/utils/momentInput.ts"),
]);
const { parseMomentTime, parseMomentVideo, getMomentPatch } = require(
  path.join(output, "features/moment/utils/momentInput.js"),
);

test("times are whole API seconds, including zero and hours", () => {
  for (const [input, expected] of [
    ["0:00", 0],
    ["0:12", 12],
    ["1:00:12", 3612],
    [" 12:59 ", 779],
  ]) {
    assert.equal(parseMomentTime(input), expected);
  }
  for (const input of [
    "",
    "12",
    "-1:00",
    "0:12.5",
    "0:60",
    "1:60:00",
    "0:",
    ":12",
    "1e2:12",
    "0:1",
    "999999999999:00",
  ]) {
    assert.equal(parseMomentTime(input), null, input);
  }
});

test("video inputs accept supported YouTube URLs and reject spoofed hosts or IDs", () => {
  const id = "abcdefghijk";
  for (const input of [
    id,
    "https://youtu.be/" + id,
    "https://www.youtube.com/watch?v=" + id + "&t=12",
    "https://m.youtube.com/shorts/" + id,
    "youtube.com/embed/" + id,
  ]) {
    assert.equal(parseMomentVideo(input), id, input);
  }
  for (const input of [
    "",
    "short",
    "https://notyoutube.com/watch?v=" + id,
    "https://youtube.com.evil.example/watch?v=" + id,
    "https://youtube.com@evil.example/watch?v=" + id,
    "https://youtu.be/too-long-video-id",
    "javascript:alert(1)",
  ]) {
    assert.equal(parseMomentVideo(input), null, input);
  }
});

test("PATCH preserves omitted values, includes zero, and explicitly clears a memo", () => {
  const original = {
    momentId: 7,
    contentId: 1,
    youtubeId: "abcdefghijk",
    startTime: 12,
    endTime: 18,
    memo: "private",
    createdAt: "",
    updatedAt: "",
  };
  assert.deepEqual(getMomentPatch(original, original), {});
  assert.deepEqual(getMomentPatch(original, { ...original, startTime: 0 }), {
    startTime: 0,
  });
  assert.deepEqual(getMomentPatch(original, { ...original, memo: null }), {
    memo: null,
  });
  assert.deepEqual(
    getMomentPatch(original, {
      ...original,
      endTime: 20,
      youtubeId: "another-id-",
    }),
    { endTime: 20 },
  );
});

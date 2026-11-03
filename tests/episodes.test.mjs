import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(
  new URL("../src/features/contentDetail/utils/episodeUtils.ts", import.meta.url),
  "utf8",
);
const context = { exports: {}, Intl };
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, context);
const { getAiredEpisodes } = context.exports;

test("only past and today episodes appear; unknown and future dates stay hidden", () => {
  const episodes = ["2026-11-02", "2026-11-03", "2026-11-04", null, undefined, "", "invalid"]
    .map((airDate, index) => ({ episodeId: index + 1, airDate }));
  assert.deepEqual(
    getAiredEpisodes(episodes, new Date("2026-11-03T03:00:00Z")).map((ep) => ep.episodeId),
    [1, 2],
  );
  assert.deepEqual(getAiredEpisodes([], new Date()), []);
});

test("release date boundary uses Korea midnight regardless of browser timezone", () => {
  const episodes = [{ airDate: "2026-11-04" }];
  assert.equal(getAiredEpisodes(episodes, new Date("2026-11-03T14:59:59Z")).length, 0);
  assert.equal(getAiredEpisodes(episodes, new Date("2026-11-03T15:00:00Z")).length, 1);
});

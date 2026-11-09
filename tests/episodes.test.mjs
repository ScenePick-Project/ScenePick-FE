import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
import * as jsx from "react/jsx-runtime";

const source = await readFile(
  new URL(
    "../src/features/contentDetail/components/EpisodeTab.tsx",
    import.meta.url,
  ),
  "utf8",
);
let result;
let requestedSeason;
const context = {
  exports: {},
  require: (name) =>
    name === "react/jsx-runtime"
      ? jsx
      : {
          useContentEpisodes: (_id, season) => {
            requestedSeason = season;
            return result;
          },
        },
};
vm.runInNewContext(
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText,
  context,
);
const render = (seasonNo = 1) =>
  context.exports.EpisodeTab({ contentId: 1, seasonNo });

test("renders exactly the returned episodes including missing air dates", () => {
  result = {
    data: [undefined, null, "", "2026-11-01", "2099-01-01"].map(
      (airDate, index) => ({
        episodeId: index + 1,
        episodeNo: index + 1,
        title: `회차 ${index + 1}`,
        airDate,
      }),
    ),
  };
  const cards = render().props.children;
  assert.equal(cards.length, 5);
  assert.deepEqual(
    Array.from(cards, (card) => card.key),
    ["1", "2", "3", "4", "5"],
  );
});

test("season switch uses only that season's returned records", () => {
  result = { data: [{ episodeId: 21, episodeNo: 1, title: "시즌 2" }] };
  const cards = render(2).props.children;
  assert.equal(requestedSeason, 2);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].key, "21");
});

test("empty, loading and error states stay distinct", () => {
  result = { data: [] };
  assert.match(render().props.children, /등록된 에피소드가 없습니다/);
  result = { isLoading: true };
  assert.match(render().props.children, /불러오는 중/);
  result = { isError: true };
  assert.match(render().props.children, /불러오지 못했습니다/);
});

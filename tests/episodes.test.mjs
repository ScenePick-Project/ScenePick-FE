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

test("renders episodes with details regardless of air date", () => {
  result = {
    data: [undefined, null, "", "2026-11-01", "2099-01-01"].map(
      (airDate, index) => ({
        episodeId: index + 1,
        episodeNo: index + 1,
        title: `특별한 이야기 ${index + 1}`,
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

test("hides episodes with only generic title, number and air date", () => {
  result = {
    data: [
      {
        episodeId: 1,
        episodeNo: 8,
        title: "8화",
        summary: null,
        stillImageUrl: null,
        airDate: "2026-11-10",
      },
      {
        episodeId: 2,
        episodeNo: 9,
        title: "Episode 9",
        summary: "  ",
        stillImageUrl: "",
      },
      { episodeId: 3, episodeNo: 10, title: "에피소드 10" },
      {
        episodeId: 4,
        episodeNo: 11,
        title: "11화",
        summary: "줄거리가 있어요",
      },
      {
        episodeId: 5,
        episodeNo: 12,
        title: "12화",
        stillImageUrl: "https://example.com/still.jpg",
      },
      { episodeId: 6, episodeNo: 13, title: "새로운 시작" },
      { episodeId: 7, episodeNo: 14, title: "", summary: "내용" },
    ],
  };
  assert.deepEqual(
    Array.from(render().props.children, (card) => card.key),
    ["4", "5", "6", "7"],
  );
});

test("shows empty state if all returned episodes are placeholders", () => {
  result = {
    data: [{ episodeId: 8, episodeNo: 8, title: "8화", airDate: "2026-11-10" }],
  };
  assert.match(render().props.children, /등록된 에피소드가 없습니다/);
});

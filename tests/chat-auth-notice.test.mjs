import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
import * as jsx from "react/jsx-runtime";

const source = await readFile(
  new URL("../src/features/chat/ContentChat.tsx", import.meta.url),
  "utf8",
);
const code = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
  },
}).outputText;

function setup(status = 500) {
  let showError = false;
  let retries = 0;
  const user = {
    isPending: false,
    isError: true,
    isFetching: false,
    error: { response: { status } },
    refetch: () => { retries += 1; },
  };
  const dependencies = {
    "react/jsx-runtime": jsx,
    react: { useState: () => [showError, (value) => { showError = value; }] },
    axios: { isAxiosError: () => true },
    "@tanstack/react-query": {
      useQuery: () => user,
      useQueryClient: () => ({}),
    },
  };
  const context = { exports: {}, require: (name) => dependencies[name] ?? {} };
  vm.runInNewContext(code, context);
  return {
    user,
    render: () => context.exports.ContentChat({ contentId: 1 }).props,
    retries: () => retries,
  };
}

test("chat auth failure appears only after participation click and supports retry", () => {
  const fixture = setup();
  const before = fixture.render().authNotice.props.children;
  assert.equal(before[0], false);
  assert.equal(before[1].props.children, "채팅 참여하기");
  before[1].props.onClick();
  const after = fixture.render().authNotice.props.children;
  assert.match(after[0].props.children, /로그인 상태를 확인하지 못했어요/);
  assert.equal(after[1].props.children, "로그인 상태 다시 확인");
  assert.equal(fixture.retries(), 1);
  fixture.user.isFetching = true;
  assert.equal(fixture.render().authNotice.props.children[1].props.disabled, true);
  fixture.user.isFetching = false;
  fixture.user.isError = false;
  fixture.user.data = { userId: "member" };
  assert.equal(fixture.render().authNotice, undefined);
  assert.equal(fixture.render().userId, "member");
});

test("unauthenticated users retain login entry; pending users retain loading notice", () => {
  const fixture = setup(401);
  assert.equal(fixture.render().authNotice, undefined);
  assert.equal(fixture.render().userId, undefined);
  fixture.user.isPending = true;
  assert.equal(fixture.render().authNotice.props.children, "로그인 상태 확인 중…");
});

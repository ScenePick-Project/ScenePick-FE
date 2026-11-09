import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { setImmediate } from "node:timers";
import ts from "typescript";
import * as jsx from "react/jsx-runtime";

async function compile(path, dependencies) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const context = { exports: {}, require: (name) => dependencies[name] ?? {} };
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    context,
  );
  return context.exports;
}
const model = await compile("../src/features/chat/chatModel.ts", {});
const children = (node) =>
  !node || typeof node !== "object"
    ? []
    : [node, ...[node.props?.children].flat(Infinity).flatMap(children)];
function find(tree, predicate) {
  return children(tree).find(predicate);
}
async function setup(status = 401) {
  let index = 0;
  const state = [];
  let retries = 0;
  const sent = [];
  const user = {
    isPending: false,
    isError: true,
    isFetching: false,
    error: { response: { status } },
    refetch: () => {
      retries++;
    },
  };
  const chat = {
    connection: "offline",
    messages: [],
    send: async (body) => {
      sent.push(body);
      return true;
    },
  };
  const { ContentChat } = await compile(
    "../src/features/chat/ContentChat.tsx",
    {
      "react/jsx-runtime": jsx,
      react: {
        useState: (initial) => {
          const i = index++;
          if (!(i in state)) state[i] = initial;
          return [
            state[i],
            (v) => {
              state[i] = typeof v === "function" ? v(state[i]) : v;
            },
          ];
        },
        useRef: (initial) => {
          const i = index++;
          if (!(i in state)) state[i] = { current: initial };
          return state[i];
        },
        useEffect() {},
        useLayoutEffect() {},
      },
      axios: { isAxiosError: () => true },
      "react-router-dom": {
        useLocation: () => ({ pathname: "/content/1", search: "?type=TV" }),
        Link: "a",
      },
      "@/components/ui/Modal": { Modal: "modal" },
      "@tanstack/react-query": {
        useQuery: () => user,
        useQueryClient: () => ({}),
      },
      "./chatModel": model,
      "./useContentChat": { useContentChat: () => chat },
      "./chatApi": {
        verifyChatIdentity: async () => ({ user: user.data, refreshed: false }),
      },
    },
  );
  // Cache writes are irrelevant to this component-level fixture.
  const props = () => ContentChat({ contentId: 1 }).props;
  const render = () => {
    index = 0;
    const room = ContentChat({ contentId: 1 });
    return room.type({
      ...room.props,
      verifyUser: async () => ({ userId: user.data?.userId, refreshed: false }),
    });
  };
  const input = () => find(render(), (n) => n.type === "textarea");
  const modal = () => find(render(), (n) => n.type === "modal");
  const submit = () =>
    find(render(), (n) => n.type === "form").props.onSubmit({
      preventDefault() {},
    });
  return {
    user,
    chat,
    props,
    render,
    input,
    modal,
    submit,
    sent,
    retries: () => retries,
    type: (value) => input().props.onChange({ target: { value } }),
  };
}

test("guest can type and submit while offline; popup preserves draft and redirect", async () => {
  const f = await setup();
  f.type("좋은 장면이에요");
  assert.equal(
    find(f.render(), (n) => n.props?.type === "submit").props.disabled,
    false,
  );
  f.submit();
  assert.equal(f.modal().props.open, true);
  assert.deepEqual(f.sent, []);
  assert.equal(
    find(f.modal(), (n) => n.type === "a").props.to,
    "/login?redirect=%2Fcontent%2F1%3Ftype%3DTV",
  );
  f.modal().props.onClose();
  assert.equal(f.modal().props.open, false);
  assert.equal(f.input().props.value, "좋은 장면이에요");
});

test("Enter opens popup, but Shift+Enter and IME composition do not", async () => {
  const f = await setup();
  f.type("안녕");
  const key = (extra = {}) =>
    f
      .input()
      .props.onKeyDown({
        key: "Enter",
        nativeEvent: {},
        preventDefault() {},
        ...extra,
      });
  key({ shiftKey: true });
  assert.equal(f.modal().props.open, false);
  key({ nativeEvent: { isComposing: true } });
  assert.equal(f.modal().props.open, false);
  f.input().props.onCompositionStart();
  key();
  assert.equal(f.modal().props.open, false);
  f.input().props.onCompositionEnd();
  key({ keyCode: 229 });
  assert.equal(f.modal().props.open, false);
  key();
  assert.equal(f.modal().props.open, true);
});

test("empty, oversized and pending inputs do not open login popup", async () => {
  const f = await setup();
  for (const value of ["", " ", "가".repeat(501)]) {
    f.type(value);
    f.submit();
    assert.equal(f.modal().props.open, false);
  }
  f.type("메시지");
  f.user.isPending = true;
  f.submit();
  assert.equal(f.modal().props.open, false);
  assert.equal(
    find(f.render(), (n) => n.props?.type === "submit").props.disabled,
    true,
  );
});

test("auth lookup errors appear in popup with retry, not a login link", async () => {
  const f = await setup(500);
  f.type("메시지");
  assert.equal(f.modal().props.open, false);
  f.submit();
  assert.equal(f.modal().props.open, true);
  assert.equal(
    find(f.modal(), (n) => n.type === "a"),
    undefined,
  );
  const notice = f.props().authNotice;
  notice.props.children[1].props.onClick();
  assert.equal(f.retries(), 1);
  f.user.isFetching = true;
  assert.equal(f.props().authNotice.props.children[1].props.disabled, true);
});

test("authenticated connected user still sends and clears draft", async () => {
  const f = await setup();
  f.user.isError = false;
  f.user.data = { userId: "me" };
  f.chat.connection = "connected";
  f.type("보내기");
  f.submit();
  await new Promise(setImmediate);
  assert.deepEqual(f.sent, ["보내기"]);
  assert.equal(f.input().props.value, "");
  assert.equal(f.modal().props.open, false);
});

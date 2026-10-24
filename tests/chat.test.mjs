import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { setTimeout, clearTimeout, setImmediate } from "node:timers";
import ts from "typescript";

async function module(name, dependencies = {}) {
  const source = await readFile(
    new URL(`../src/features/chat/${name}.ts`, import.meta.url),
    "utf8",
  );
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const context = {
    exports: {},
    require: (name) => dependencies[name],
    setTimeout,
    clearTimeout,
  };
  vm.runInNewContext(code, context);
  return context.exports;
}
const model = await module("chatModel");
const { ChatSession } = await module("chatSession", { "./chatModel": model });
const tick = () => new Promise(setImmediate);
const message = (id, body = "안녕하세요", userId = "me") => ({
  messageId: String(id),
  contentId: 1,
  userId,
  nickname: userId,
  profileImageUrl: null,
  body,
  createdAt: "2026-10-22T10:00:00",
});
const page = (ids, hasNext = false) => ({
  items: ids.map((id) => message(id)),
  nextCursor: ids.length ? String(ids.at(-1)) : null,
  hasNext,
});
class Socket {
  connected = false;
  subscriptions = new Map();
  receipts = new Map();
  published = [];
  activate() {}
  async deactivate() {
    this.close();
  }
  forceDisconnect() {
    this.close();
  }
  subscribe(destination, callback, headers = {}) {
    this.subscriptions.set(destination, callback);
    if (headers.receipt) this.receipt = headers.receipt;
  }
  watchForReceipt(id, callback) {
    this.receipts.set(id, callback);
  }
  publish(frame) {
    this.published.push(frame);
  }
  connect() {
    this.connected = true;
    this.onConnect();
  }
  acknowledge() {
    this.receipts.get(this.receipt)();
  }
  close() {
    this.connected = false;
    this.onWebSocketClose?.();
  }
  receive(item) {
    this.subscriptions.get("/topic/contents/1/chat")({
      body: JSON.stringify(item),
    });
  }
  error(code) {
    this.subscriptions.get("/user/queue/chat/errors")({
      body: JSON.stringify({ code }),
    });
  }
}
function setup(t, load, userId = "me") {
  const socket = new Socket();
  const session = new ChatSession(
    1,
    userId,
    socket,
    load,
    () => {},
    async () => {},
  );
  t.after(() => session.dispose());
  session.start();
  return { session, socket };
}
async function connect(socket) {
  socket.connect();
  socket.acknowledge();
  await tick();
}

test("IDs beyond JS safe integers stay distinct and sort numerically", () => {
  const messages = model.mergeMessages(
    [message("9007199254740993")],
    [message("9007199254740992"), message("9007199254740993"), message("10")],
  );
  assert.equal(
    messages.map((item) => item.messageId).join(","),
    "10,9007199254740992,9007199254740993",
  );
  assert.throws(() => model.parseMessage({ ...message(1), contentId: 2 }, 1));
  assert.throws(() => model.parseMessage({ ...message(1), messageId: 1 }, 1));
  assert.throws(() =>
    model.parsePage({ items: [], hasNext: true, nextCursor: null }, 1),
  );
});

test("500 Unicode code points accepted, blanks/NUL/501 rejected", () => {
  assert.equal(model.validateBody("😀".repeat(500)), null);
  assert.equal(model.messageLength("  😀안녕  "), 3);
  for (const body of [" \n ", "😀".repeat(501), "a\0b"])
    assert.ok(model.validateBody(body));
});

test("expired identity refreshes once before checking the user again", async () => {
  let checks = 0;
  let refreshes = 0;
  const api = await module("chatApi", {
    "@shared/api/axios.ts": { default: { defaults: {} } },
    axios: { isAxiosError: (error) => error.isAxiosError },
    "@features/user/api/userApi.ts": {
      checkLogin: async () => {
        if (++checks === 1)
          throw { isAxiosError: true, response: { data: { code: "JWT4011" } } };
        return { userId: "me" };
      },
    },
    "@shared/request.ts": {
      request: async (request) => {
        assert.equal(request.url, "/user/refresh");
        assert.equal(request.method, "POST");
        refreshes++;
      },
    },
    "./chatModel": model,
  });
  const identity = await api.verifyChatIdentity();
  assert.equal(identity.user.userId, "me");
  assert.equal(identity.refreshed, true);
  assert.equal(checks, 2);
  assert.equal(refreshes, 1);
});

test("anonymous/invalid auth does not enter a refresh loop", async () => {
  const failure = {
    isAxiosError: true,
    response: { data: { code: "COMMON401" } },
  };
  const api = await module("chatApi", {
    "@shared/api/axios.ts": { default: { defaults: {} } },
    axios: { isAxiosError: () => true },
    "@features/user/api/userApi.ts": {
      checkLogin: async () => {
        throw failure;
      },
    },
    "@shared/request.ts": {
      request: async () => assert.fail("unexpected refresh"),
    },
    "./chatModel": model,
  });
  await assert.rejects(api.verifyChatIdentity(), (error) => error === failure);
});

test("connected guests can receive but cannot publish", async (t) => {
  const { session, socket } = setup(
    t,
    async (cursor) => (cursor ? page([]) : page([1])),
    null,
  );
  await connect(socket);
  socket.receive(message(2, "공개 메시지", "other"));
  assert.equal(session.state.messages.length, 2);
  assert.equal(await session.send("비회원 전송"), false);
  assert.equal(socket.published.length, 0);
});

test("receipt gates catchup; buffered live message cannot skip two recovery pages", async (t) => {
  const cursors = [];
  const { session, socket } = setup(t, async (cursor = {}) => {
    cursors.push(cursor.afterId);
    if (!cursor.afterId) return page([10]);
    if (cursor.afterId === "10") return page([11, 12], true);
    if (cursor.afterId === "12") return page([13]);
    assert.fail("wrong recovery cursor");
  });
  await tick();
  socket.connect();
  socket.receive(message(14));
  await tick();
  assert.equal(cursors.length, 1);
  assert.equal(session.state.messages.length, 1);
  socket.acknowledge();
  await tick();
  assert.equal(cursors.join(","), ",10,12");
  assert.equal(
    session.state.messages.map((item) => item.messageId).join(","),
    "10,11,12,13,14",
  );
  assert.equal(session.state.connection, "connected");
});

test("reconnect recovers from confirmed boundary, deduplicates overlapping live frames", async (t) => {
  const cursors = [];
  const { session, socket } = setup(t, async (cursor = {}) => {
    cursors.push(cursor.afterId);
    return !cursor.afterId
      ? page([1])
      : cursor.afterId === "1"
        ? page([])
        : page([3, 4]);
  });
  await connect(socket);
  socket.receive(message(2));
  socket.close();
  socket.connect();
  socket.receive(message(4));
  socket.acknowledge();
  await tick();
  assert.equal(cursors.at(-1), "2");
  assert.equal(
    session.state.messages.map((item) => item.messageId).join(","),
    "1,2,3,4",
  );
});

test("failed recovery does not advance cursor; retry recovers the missing messages", async (t) => {
  let fail = true;
  const seen = [];
  const { session, socket } = setup(t, async (cursor = {}) => {
    if (!cursor.afterId) return page([1]);
    seen.push(cursor.afterId);
    if (fail) throw new Error("offline");
    return page([2, 3]);
  });
  await connect(socket);
  socket.receive(message(4));
  assert.equal(session.state.connection, "offline");
  fail = false;
  await session.retry();
  await connect(socket);
  assert.equal(seen.join(","), "1,1");
  assert.equal(
    session.state.messages.map((item) => item.messageId).join(","),
    "1,2,3",
  );
});

test("send waits for saved echo, rejects duplicates, and sends only body", async (t) => {
  const { session, socket } = setup(t, async (cursor) =>
    cursor ? page([]) : page([1]),
  );
  await connect(socket);
  const sent = session.send(" 새 메시지 ");
  assert.equal(session.state.sending, true);
  assert.equal(socket.published[0].destination, "/app/chat/1/messages");
  assert.deepEqual(JSON.parse(socket.published[0].body), { body: "새 메시지" });
  assert.equal(await session.send("중복"), false);
  socket.receive(message(2, "새 메시지", "other"));
  assert.equal(session.state.sending, true);
  socket.receive(message(3, "새 메시지"));
  assert.equal(await sent, true);
  assert.equal(session.state.sending, false);
});

test("server rate rejection and lost connection preserve failure; reconnect never republishes", async (t) => {
  const { session, socket } = setup(t, async (cursor) =>
    cursor ? page([]) : page([1]),
  );
  await connect(socket);
  const sent = session.send("보내기");
  socket.error("CHAT4291");
  assert.equal(await sent, false);
  assert.match(session.state.sendError, /1초/);
  socket.close();
  await connect(socket);
  assert.equal(socket.published.length, 1);
});

test("anonymous sends are rejected and disposal ignores late REST / live callbacks", async (t) => {
  let resolvePage;
  const { session, socket } = setup(
    t,
    () =>
      new Promise((resolve) => {
        resolvePage = resolve;
      }),
    undefined,
  );
  assert.equal(await session.send("hello"), false);
  socket.connect();
  session.dispose();
  resolvePage(page([1]));
  socket.receive(message(2));
  await tick();
  assert.equal(session.state.messages.length, 0);
  assert.equal(socket.published.length, 0);
});

test("older page failure keeps messages and supports retry without overlapping requests", async (t) => {
  let fail = true;
  let olderCalls = 0;
  const { session, socket } = setup(t, async (cursor = {}) => {
    if (cursor.beforeId) {
      olderCalls++;
      if (fail) throw new Error("offline");
      return page([1]);
    }
    return cursor.afterId ? page([]) : page([3, 2], true);
  });
  await connect(socket);
  const older = session.loadOlder();
  await session.loadOlder();
  await older;
  assert.equal(olderCalls, 1);
  assert.ok(session.state.olderError);
  fail = false;
  await session.loadOlder();
  assert.equal(
    session.state.messages.map((item) => item.messageId).join(","),
    "1,2,3",
  );
});

test("a slow initial response cannot overwrite a newer retry snapshot", async (t) => {
  const initial = [];
  const { session, socket } = setup(t, (cursor) =>
    cursor
      ? Promise.resolve(page([]))
      : new Promise((resolve) => initial.push(resolve)),
  );
  await session.retry();
  socket.connect();
  socket.acknowledge();
  initial[1](page([5]));
  await tick();
  initial[0](page([1], true));
  await tick();
  assert.equal(
    session.state.messages.map((item) => item.messageId).join(","),
    "5",
  );
  assert.equal(session.state.hasOlder, false);
});

test("disconnect during SEND rejects it and never automatically resends", async (t) => {
  const { session, socket } = setup(t, async (cursor) =>
    cursor ? page([]) : page([1]),
  );
  await connect(socket);
  const pending = session.send("전송 중 연결 중단");
  socket.close();
  assert.equal(await pending, false);
  assert.match(session.state.sendError, /전송 결과/);
  await connect(socket);
  assert.equal(socket.published.length, 1);
  session.dispose();
  assert.equal(await session.send("종료된 세션"), false);
});

test("expired STOMP auth refreshes credentials and reconnects without resending", async (t) => {
  const socket = new Socket();
  let refreshes = 0;
  const session = new ChatSession(
    1,
    "me",
    socket,
    async (cursor) => (cursor ? page([]) : page([1])),
    () => {},
    async () => {
      refreshes++;
    },
  );
  t.after(() => session.dispose());
  session.start();
  await connect(socket);
  const pending = session.send("만료된 연결");
  socket.onStompError({ headers: { message: "JWT4011" }, body: "JWT4011" });
  assert.equal(await pending, false);
  await tick();
  assert.equal(refreshes, 1);
  await connect(socket);
  assert.equal(session.state.connection, "connected");
  assert.equal(socket.published.length, 1);
});

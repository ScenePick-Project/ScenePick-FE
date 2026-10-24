import type { Client } from "@stomp/stompjs";
import {
  chatError,
  mergeMessages,
  parseMessage,
  validateBody,
  type ChatConnection,
  type ChatCursor,
  type ChatMessage,
  type ChatPage,
} from "./chatModel";

export interface ChatState {
  messages: ChatMessage[];
  connection: ChatConnection;
  loading: boolean;
  loadingOlder: boolean;
  hasOlder: boolean;
  sending: boolean;
  coolingDown: boolean;
  historyError: string | null;
  olderError: string | null;
  sendError: string | null;
  connectionError: string | null;
}

export const initialChatState: ChatState = {
  messages: [],
  connection: "connecting",
  loading: true,
  loadingOlder: false,
  hasOlder: false,
  sending: false,
  coolingDown: false,
  historyError: null,
  olderError: null,
  sendError: null,
  connectionError: null,
};

type PendingSend = {
  body: string;
  afterId: string;
  resolve: (sent: boolean) => void;
};

// Each mounted room owns one session. Recovery never advances its cursor from buffered live events.
export class ChatSession {
  state: ChatState = { ...initialChatState };
  private disposed = false;
  private epoch = 0;
  private ready = false;
  private initialized = false;
  private lastId = "0";
  private beforeId: string | null = null;
  private buffer: ChatMessage[] = [];
  private pending: PendingSend | null = null;
  private sendTimer?: ReturnType<typeof setTimeout>;
  private receiptTimer?: ReturnType<typeof setTimeout>;
  private cooldownTimer?: ReturnType<typeof setTimeout>;
  private nextSendAt = 0;
  private initialLoad?: Promise<void>;
  private initialRequest = 0;
  private refreshAttempted = false;
  private readonly contentId: number;
  private readonly userId: string | undefined;
  private readonly client: Client;
  private readonly load: (cursor?: ChatCursor) => Promise<ChatPage>;
  private readonly changed: (state: ChatState) => void;
  private readonly refreshAuth: () => Promise<void>;

  constructor(
    contentId: number,
    userId: string | undefined,
    client: Client,
    load: (cursor?: ChatCursor) => Promise<ChatPage>,
    changed: (state: ChatState) => void,
    refreshAuth: () => Promise<void>,
  ) {
    this.contentId = contentId;
    this.userId = userId;
    this.client = client;
    this.load = load;
    this.changed = changed;
    this.refreshAuth = refreshAuth;
  }

  private update(patch: Partial<ChatState>) {
    if (this.disposed) return;
    this.state = { ...this.state, ...patch };
    this.changed(this.state);
  }

  start() {
    this.client.onConnect = () => {
      if (this.disposed) return;
      const epoch = ++this.epoch;
      this.ready = false;
      this.buffer = [];
      this.update({ connection: "syncing", connectionError: null });
      this.client.subscribe("/user/queue/chat/errors", (frame) => {
        if (this.disposed || epoch !== this.epoch) return;
        try {
          const error = JSON.parse(frame.body) as { code?: string };
          this.failSend(chatError(error.code));
        } catch {
          this.failSend(chatError());
        }
      });
      const receipt = `chat-${this.contentId}-${epoch}`;
      this.client.watchForReceipt(receipt, () => {
        if (this.disposed || epoch !== this.epoch) return;
        clearTimeout(this.receiptTimer);
        void this.recover(epoch);
      });
      this.receiptTimer = setTimeout(() => {
        this.update({
          connectionError: "대화 연결 확인이 늦어지고 있어요. 다시 연결합니다.",
        });
        this.client.forceDisconnect();
      }, 10000);
      this.client.subscribe(
        `/topic/contents/${this.contentId}/chat`,
        (frame) => {
          if (this.disposed || epoch !== this.epoch) return;
          try {
            const message = parseMessage(
              JSON.parse(frame.body),
              this.contentId,
            );
            if (!this.ready) this.buffer.push(message);
            else {
              this.merge([message]);
              this.lastId =
                this.state.messages.at(-1)?.messageId ?? this.lastId;
              this.confirmSend(message);
            }
          } catch {
            this.update({
              connectionError: "메시지를 확인하지 못해 대화를 다시 불러옵니다.",
            });
            this.client.forceDisconnect();
          }
        },
        { receipt },
      );
    };
    this.client.onWebSocketClose = () => {
      if (this.disposed) return;
      ++this.epoch;
      clearTimeout(this.receiptTimer);
      this.ready = false;
      this.buffer = [];
      this.failSend(
        "전송 결과를 확인하지 못했어요. 연결 후 대화 내역을 확인해 주세요.",
      );
      this.update({ connection: "reconnecting" });
    };
    this.client.onStompError = (frame) => {
      if (this.disposed) return;
      const code = frame.headers.message || frame.body;
      this.failSend(chatError(code));
      this.update({ connectionError: chatError(code) });
      if (code === "JWT4011" && !this.refreshAttempted) {
        this.refreshAttempted = true;
        void this.refreshAndReconnect();
      } else {
        this.ready = false;
        void this.client
          .deactivate({ force: true })
          .then(() => this.update({ connection: "offline" }));
      }
    };
    this.initialLoad = this.loadInitial();
    this.client.activate();
  }

  private async refreshAndReconnect() {
    await this.client.deactivate({ force: true });
    if (this.disposed) return;
    try {
      await this.refreshAuth();
      if (!this.disposed) this.client.activate();
    } catch {
      this.update({
        connection: "offline",
        connectionError: "로그인이 만료됐어요. 다시 로그인해 주세요.",
      });
    }
  }

  private merge(messages: ChatMessage[]) {
    this.update({ messages: mergeMessages(this.state.messages, messages) });
  }

  private async loadInitial() {
    const request = ++this.initialRequest;
    this.update({ loading: true, historyError: null });
    try {
      const page = await this.load();
      if (this.disposed || request !== this.initialRequest) return;
      this.merge(page.items);
      this.beforeId = page.nextCursor;
      this.lastId = this.state.messages.at(-1)?.messageId ?? "0";
      this.initialized = true;
      this.update({ hasOlder: page.hasNext });
    } catch {
      if (request === this.initialRequest)
        this.update({ historyError: "대화 내역을 불러오지 못했어요." });
    } finally {
      if (request === this.initialRequest) this.update({ loading: false });
    }
  }

  private async recover(epoch: number) {
    await this.initialLoad;
    if (this.disposed || epoch !== this.epoch) return;
    this.update({ connection: "syncing", historyError: null });
    try {
      if (!this.initialized) {
        this.initialLoad = this.loadInitial();
        await this.initialLoad;
        if (this.disposed || epoch !== this.epoch) return;
        if (!this.initialized) throw new Error("initial history failed");
      }
      let cursor = this.lastId;
      const recovered: ChatMessage[] = [];
      while (true) {
        const page = await this.load({ afterId: cursor });
        if (this.disposed || epoch !== this.epoch) return;
        recovered.push(...page.items);
        if (!page.hasNext) break;
        if (!page.nextCursor || BigInt(page.nextCursor) <= BigInt(cursor))
          throw new Error("invalid cursor");
        cursor = page.nextCursor;
      }
      this.merge([...recovered, ...this.buffer]);
      this.buffer = [];
      this.lastId = this.state.messages.at(-1)?.messageId ?? this.lastId;
      this.ready = true;
      this.update({ connection: "connected", historyError: null });
    } catch {
      if (epoch === this.epoch)
        this.update({
          connection: "offline",
          historyError: "대화 복구에 실패했어요. 다시 연결해 주세요.",
        });
    }
  }

  async loadOlder() {
    if (this.state.loadingOlder || !this.state.hasOlder || !this.beforeId)
      return;
    this.update({ loadingOlder: true, olderError: null });
    try {
      const page = await this.load({ beforeId: this.beforeId });
      if (this.disposed) return;
      if (
        page.hasNext &&
        (!page.nextCursor || BigInt(page.nextCursor) >= BigInt(this.beforeId))
      ) {
        throw new Error("invalid cursor");
      }
      this.merge(page.items);
      this.beforeId = page.nextCursor;
      this.update({ hasOlder: page.hasNext });
    } catch {
      this.update({
        olderError: "이전 대화를 불러오지 못했어요. 다시 시도해 주세요.",
      });
    } finally {
      this.update({ loadingOlder: false });
    }
  }

  async retry() {
    if (this.disposed) return;
    this.ready = false;
    this.update({ connection: "connecting", connectionError: null });
    await this.client.deactivate({ force: true });
    if (this.disposed) return;
    if (!this.initialized) this.initialLoad = this.loadInitial();
    this.refreshAttempted = false;
    this.client.activate();
  }

  send(body: string): Promise<boolean> {
    if (this.disposed) return Promise.resolve(false);
    const error = validateBody(body);
    if (
      error ||
      !this.userId ||
      !this.ready ||
      !this.client.connected ||
      this.pending ||
      Date.now() < this.nextSendAt
    ) {
      this.update({
        sendError:
          error ??
          (!this.userId
            ? "로그인 후 메시지를 보낼 수 있어요."
            : "연결 상태를 확인하고 잠시 후 다시 시도해 주세요."),
      });
      return Promise.resolve(false);
    }
    const text = body.trim();
    this.nextSendAt = Date.now() + 1000;
    this.update({ sending: true, coolingDown: true, sendError: null });
    this.cooldownTimer = setTimeout(
      () => this.update({ coolingDown: false }),
      1000,
    );
    return new Promise((resolve) => {
      this.pending = { body: text, afterId: this.lastId, resolve };
      this.sendTimer = setTimeout(
        () =>
          this.failSend(
            "전송 결과를 확인하지 못했어요. 대화 내역을 확인한 후 다시 시도해 주세요.",
          ),
        10000,
      );
      try {
        this.client.publish({
          destination: `/app/chat/${this.contentId}/messages`,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ body: text }),
        });
      } catch {
        this.failSend(
          "연결이 끊겨 메시지를 보내지 못했어요. 입력한 내용은 유지됩니다.",
        );
      }
    });
  }

  private confirmSend(message: ChatMessage) {
    const pending = this.pending;
    if (
      !pending ||
      message.userId !== this.userId ||
      message.body !== pending.body ||
      BigInt(message.messageId) <= BigInt(pending.afterId)
    )
      return;
    clearTimeout(this.sendTimer);
    this.pending = null;
    this.refreshAttempted = false;
    this.update({ sending: false, sendError: null });
    pending.resolve(true);
  }

  private failSend(message: string) {
    if (!this.pending) return;
    clearTimeout(this.sendTimer);
    const pending = this.pending;
    this.pending = null;
    this.update({ sending: false, sendError: message });
    pending.resolve(false);
  }

  dispose() {
    this.disposed = true;
    ++this.epoch;
    clearTimeout(this.receiptTimer);
    clearTimeout(this.sendTimer);
    clearTimeout(this.cooldownTimer);
    this.pending?.resolve(false);
    this.pending = null;
    void this.client.deactivate({ force: true });
  }
}

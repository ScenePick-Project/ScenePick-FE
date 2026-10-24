export interface ChatMessage {
  messageId: string;
  contentId: number;
  userId: string;
  nickname: string;
  profileImageUrl: string | null;
  body: string;
  createdAt: string;
}

export interface ChatPage {
  items: ChatMessage[];
  nextCursor: string | null;
  hasNext: boolean;
}

export type ChatCursor = { beforeId?: string; afterId?: string };
export type ChatConnection =
  | "connecting"
  | "syncing"
  | "connected"
  | "reconnecting"
  | "offline";

const isId = (value: unknown): value is string =>
  typeof value === "string" && /^[1-9]\d*$/.test(value);

export function parseMessage(value: unknown, contentId: number): ChatMessage {
  if (!value || typeof value !== "object")
    throw new Error("잘못된 메시지 응답입니다.");
  const message = value as ChatMessage;
  if (
    !isId(message.messageId) ||
    message.contentId !== contentId ||
    typeof message.userId !== "string" ||
    typeof message.nickname !== "string" ||
    typeof message.body !== "string" ||
    typeof message.createdAt !== "string" ||
    Number.isNaN(Date.parse(message.createdAt)) ||
    !(
      message.profileImageUrl === null ||
      typeof message.profileImageUrl === "string"
    )
  )
    throw new Error("잘못된 메시지 응답입니다.");
  return message;
}

export function parsePage(value: unknown, contentId: number): ChatPage {
  if (!value || typeof value !== "object")
    throw new Error("잘못된 내역 응답입니다.");
  const page = value as ChatPage;
  if (
    !Array.isArray(page.items) ||
    typeof page.hasNext !== "boolean" ||
    !(page.nextCursor === null || isId(page.nextCursor)) ||
    (page.hasNext && (!page.nextCursor || page.items.length === 0))
  )
    throw new Error("잘못된 내역 응답입니다.");
  return {
    ...page,
    items: page.items.map((item) => parseMessage(item, contentId)),
  };
}

export function mergeMessages(
  current: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const messages = new Map(
    current.map((message) => [message.messageId, message]),
  );
  for (const message of incoming) messages.set(message.messageId, message);
  return [...messages.values()].sort((a, b) =>
    BigInt(a.messageId) < BigInt(b.messageId)
      ? -1
      : a.messageId === b.messageId
        ? 0
        : 1,
  );
}

export const messageLength = (body: string) => Array.from(body.trim()).length;

export function validateBody(body: string): string | null {
  if (!body.trim()) return "메시지를 입력해 주세요.";
  if (body.includes("\0")) return "사용할 수 없는 문자가 포함되어 있어요.";
  if (messageLength(body) > 500) return "메시지는 500자까지 보낼 수 있어요.";
  return null;
}

export function chatError(code?: string): string {
  if (code === "CHAT4291")
    return "메시지는 1초에 한 번 보낼 수 있어요. 잠시 후 다시 시도해 주세요.";
  if (code === "COMMON401" || code?.startsWith("JWT"))
    return "로그인 상태를 확인해 주세요. 입력한 메시지는 유지됩니다.";
  if (code === "COMMON403") return "메시지를 보낼 권한이 없어요.";
  if (code === "CONTENT4041") return "작품을 찾을 수 없어요.";
  if (code === "COMMON400") return "메시지 내용을 확인해 주세요.";
  return "메시지를 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
}

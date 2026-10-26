import api from "@shared/api/axios.ts";
import { isAxiosError } from "axios";
import { checkLogin } from "@features/user/api/userApi.ts";
import { request } from "@shared/request.ts";
import { parsePage, type ChatCursor } from "./chatModel";

export async function verifyChatIdentity() {
  try {
    return { user: await checkLogin(), refreshed: false };
  } catch (error) {
    if (!isAxiosError(error) || error.response?.data?.code !== "JWT4011")
      throw error;
    await request({ method: "POST", url: "/user/refresh" });
    return { user: await checkLogin(), refreshed: true };
  }
}

export async function getChatMessages(
  contentId: number,
  cursor: ChatCursor = {},
) {
  const result = await request<unknown>({
    method: "GET",
    url: `/contents/${contentId}/chat/messages`,
    query: { size: 50, ...cursor },
  });
  return parsePage(result, contentId);
}

export function chatSocketUrl() {
  const base = new URL(
    api.defaults.baseURL ?? "/api/v1",
    window.location.origin,
  );
  const url = new URL("/ws/chat", base);
  url.protocol = base.protocol === "https:" ? "wss:" : "ws:";
  return url.href;
}

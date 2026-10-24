import { useEffect, useRef, useState } from "react";
import { Client, Versions } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { request } from "@shared/request.ts";
import { chatSocketUrl, getChatMessages } from "./chatApi";
import { ChatSession, initialChatState } from "./chatSession";

export function useContentChat(contentId: number, userId?: string) {
  const [state, setState] = useState(initialChatState);
  const session = useRef<ChatSession | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setState(initialChatState);
    const client = new Client({
      brokerURL: chatSocketUrl(),
      reconnectDelay: 3000,
      connectionTimeout: 10000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      stompVersions: new Versions(["1.2"]),
    });
    const current = new ChatSession(
      contentId,
      userId,
      client,
      (cursor) => getChatMessages(contentId, cursor),
      setState,
      async () => {
        await request({ method: "POST", url: "/user/refresh" });
        await queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      },
    );
    session.current = current;
    current.start();
    return () => {
      session.current = null;
      current.dispose();
    };
  }, [contentId, userId, queryClient]);

  return {
    ...state,
    send: (body: string) =>
      session.current?.send(body) ?? Promise.resolve(false),
    loadOlder: () => session.current?.loadOlder() ?? Promise.resolve(),
    retry: () => void session.current?.retry(),
  };
}

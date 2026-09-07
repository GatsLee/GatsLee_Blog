"use client";

import ChatRoot from "@/components/chat/ChatRoot";

interface ChatWidgetProps {
  initialMessage: string;
  defaultOpen?: boolean;
}

export default function ChatWidget(props: ChatWidgetProps) {
  return <ChatRoot {...props} />;
}

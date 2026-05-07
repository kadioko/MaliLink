"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useToast } from "@/components/toast";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: { name: string; role: string };
  senderId: string;
};

type OrderMessagesProps = {
  orderId: string;
  currentUserId: string;
  currentUserRole: string;
  initialMessages: Message[];
};

export function OrderMessages({ orderId, currentUserId, currentUserRole, initialMessages }: OrderMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || isSending) return;
    setIsSending(true);
    setText("");

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      sender: { name: "You", role: currentUserRole },
      senderId: currentUserId,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const { message } = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? message : m)));
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        toast.error("Message failed", "Could not send your message.");
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      toast.error("Network error", "Please check your connection and try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-72 min-h-[120px] space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">No messages yet. Start the conversation.</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isOwn ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                  {!isOwn ? (
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-60">
                      {msg.sender.name} · {msg.sender.role}
                    </p>
                  ) : null}
                  <p className="leading-5">{msg.content}</p>
                  <p className={`mt-1 text-[11px] ${isOwn ? "text-white/60" : "text-gray-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          disabled={isSending}
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={isSending || !text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

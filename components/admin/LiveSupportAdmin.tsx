'use client';

import { useCallback, useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { baseAPI } from '@/services/types';

type SupportConversation = {
  id: number;
  user_name: string;
  topic: string;
  doctor_id: number | null;
  updated_at: string;
  last_message?: { body: string; created_at: string } | null;
};

type SupportMessage = {
  id: number;
  body: string;
  is_staff: boolean;
  sender_name: string;
  created_at: string;
};

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('auth_token') || 'null') as string | null;
  } catch {
    return null;
  }
}

export default function LiveSupportAdmin() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const authHeaders = useCallback(() => {
    const token = getAuthToken();
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const loadConversations = useCallback(async () => {
    const response = await fetch(`${baseAPI}/api/support/live/admin/conversations/`, {
      headers: authHeaders(),
    });
    if (!response.ok) return;
    const data = (await response.json()) as SupportConversation[];
    setConversations(data);
    if (!selectedId && data.length) {
      setSelectedId(data[0].id);
    }
  }, [authHeaders, selectedId]);

  const loadMessages = useCallback(
    async (conversationId: number) => {
      const response = await fetch(
        `${baseAPI}/api/support/live/conversations/${conversationId}/messages/`,
        { headers: authHeaders() },
      );
      if (!response.ok) return;
      const data = (await response.json()) as SupportMessage[];
      setMessages(data);
    },
    [authHeaders],
  );

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadConversations();
      setLoading(false);
    })();
    const interval = window.setInterval(() => {
      void loadConversations();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) return;
    void loadMessages(selectedId);
    const interval = window.setInterval(() => {
      void loadMessages(selectedId);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [selectedId, loadMessages]);

  const handleSend = async () => {
    const body = input.trim();
    if (!body || !selectedId || sending) return;
    setSending(true);
    try {
      const response = await fetch(
        `${baseAPI}/api/support/live/conversations/${selectedId}/messages/`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ body }),
        },
      );
      if (response.ok) {
        setInput('');
        await loadMessages(selectedId);
        await loadConversations();
      }
    } finally {
      setSending(false);
    }
  };

  const selected = conversations.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
        <MessageCircle className="h-5 w-5 text-sky-600" />
        Live Support Inbox
      </h2>

      {loading ? (
        <p className="text-sm text-slate-500">Loading conversations...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="max-h-[520px] space-y-2 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-sm text-slate-500">No open support chats.</p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelectedId(conversation.id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left ${
                    selectedId === conversation.id
                      ? 'border-sky-300 bg-sky-50'
                      : 'border-slate-200 bg-white hover:border-sky-200'
                  }`}
                >
                  <p className="font-semibold text-slate-900">{conversation.user_name}</p>
                  <p className="text-xs text-slate-500">{conversation.topic}</p>
                  {conversation.doctor_id ? (
                    <p className="text-xs text-sky-700">Doctor #{conversation.doctor_id}</p>
                  ) : null}
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                    {conversation.last_message?.body ?? 'No messages yet'}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="flex min-h-[420px] flex-col rounded-xl border border-slate-200">
            {selected ? (
              <>
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="font-semibold text-slate-900">{selected.user_name}</p>
                  <p className="text-xs text-slate-500">
                    {selected.topic}
                    {selected.doctor_id ? ` · Doctor #${selected.doctor_id}` : ''}
                  </p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        message.is_staff
                          ? 'ml-auto bg-sky-600 text-white'
                          : 'mr-auto bg-white text-slate-800 shadow-sm'
                      }`}
                    >
                      <p className="mb-1 text-[11px] font-semibold opacity-80">
                        {message.is_staff ? 'You (Admin)' : message.sender_name}
                      </p>
                      <p>{message.body}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 p-4">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') void handleSend();
                      }}
                      placeholder="Reply to customer..."
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
                    />
                    <button
                      type="button"
                      disabled={sending || !input.trim()}
                      onClick={() => void handleSend()}
                      className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-3 py-2 text-white disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

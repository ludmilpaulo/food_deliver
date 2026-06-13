'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { readAuthToken } from '@/lib/authToken';
import { baseAPI } from '@/services/types';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';

type Conversation = {
  id: number;
  topic: string;
  status: string;
};

type ChatMessage = {
  id: number;
  body: string;
  sender_name: string;
  is_staff: boolean;
  created_at: string;
};

export default function PlatformSupportChat() {
  const { t } = useTranslation();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const authHeaders = useCallback((): HeadersInit => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = readAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, []);

  const loadConversation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseAPI}/api/support/live/conversation/?topic=platform_support`, {
        headers: authHeaders(),
      });
      if (response.status === 401) {
        setError(t('loginRequired', 'Please sign in to view messages.'));
        setLoading(false);
        return;
      }
      if (!response.ok) throw new Error('Failed to load conversation');
      const data = (await response.json()) as Conversation;
      setConversation(data);
      const messagesResponse = await fetch(
        `${baseAPI}/api/support/live/conversations/${data.id}/messages/`,
        { headers: authHeaders() },
      );
      if (!messagesResponse.ok) throw new Error('Failed to load messages');
      setMessages((await messagesResponse.json()) as ChatMessage[]);
    } catch {
      setError(t('messagesLoadError', 'Could not load messages.'));
    } finally {
      setLoading(false);
    }
  }, [authHeaders, t]);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  const sendMessage = async () => {
    if (!conversation || !draft.trim()) return;
    setSending(true);
    try {
      const response = await fetch(
        `${baseAPI}/api/support/live/conversations/${conversation.id}/messages/`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ body: draft.trim() }),
        },
      );
      if (!response.ok) throw new Error('Failed to send message');
      const message = (await response.json()) as ChatMessage;
      setMessages((prev) => [...prev, message]);
      setDraft('');
    } catch {
      setError(t('sendMessageFailed', 'Could not send message.'));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <p className="text-slate-600">{t('loading', 'Loading…')}</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <p className="text-red-700">{error}</p>
        {error.includes('sign in') ? (
          <Link href="/LoginScreenUser?next=/messages" className="mt-4 inline-block text-sky-700">
            {t('login', 'Login')}
          </Link>
        ) : (
          <button type="button" onClick={() => void loadConversation()} className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-white">
            {t('common.retry', 'Retry')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-[520px] flex-col rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="font-semibold text-slate-900">{t('supportChat', 'Kudya support')}</h2>
        <p className="text-sm text-slate-500">{t('supportChatHint', 'Chat with our team about orders, bookings, or account help.')}</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">{t('startConversation', 'Send a message to start the conversation.')}</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                message.is_staff ? 'bg-slate-100 text-slate-800' : 'ml-auto bg-sky-600 text-white'
              }`}
            >
              <p className="text-xs opacity-70">{message.sender_name}</p>
              <p>{message.body}</p>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2 border-t border-slate-100 p-4">
        <input
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2"
          placeholder={t('typeMessage', 'Type a message')}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void sendMessage();
          }}
        />
        <button
          type="button"
          disabled={sending || !draft.trim()}
          onClick={() => void sendMessage()}
          className="rounded-xl bg-sky-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {t('send', 'Send')}
        </button>
      </div>
    </div>
  );
}

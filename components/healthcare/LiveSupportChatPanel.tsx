'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { baseAPI } from '@/services/types';
import type { HealthcareTranslationKey } from '@/configs/healthcareTranslations';

type SupportMessage = {
  id: number;
  body: string;
  is_staff: boolean;
  sender_name: string;
  created_at: string;
};

type SupportConversation = {
  id: number;
  status: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  doctorId: number;
  doctorName: string;
  ht: (key: HealthcareTranslationKey) => string;
};

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('auth_token') || 'null') as string | null;
  } catch {
    return null;
  }
}

export default function LiveSupportChatPanel({ open, onClose, doctorId, doctorName, ht }: Props) {
  const router = useRouter();
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const authHeaders = useCallback(() => {
    const token = getAuthToken();
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const ensureConversation = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return null;

    const params = new URLSearchParams({
      topic: 'healthcare_booking',
      doctor_id: String(doctorId),
    });
    const response = await fetch(`${baseAPI}/api/support/live/conversation/?${params.toString()}`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error(ht('liveChatUnavailable'));
    }
    const data = (await response.json()) as SupportConversation;
    setConversation(data);
    return data;
  }, [authHeaders, doctorId, ht]);

  const fetchMessages = useCallback(
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
    if (!open) return;

    const token = getAuthToken();
    if (!token) {
      setError(ht('loginToChatSupport'));
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const conv = await ensureConversation();
        if (!active || !conv) return;
        await fetchMessages(conv.id);
      } catch {
        if (active) setError(ht('liveChatUnavailable'));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [open, ensureConversation, fetchMessages, ht]);

  useEffect(() => {
    if (!open || !conversation?.id) return;
    const interval = window.setInterval(() => {
      void fetchMessages(conversation.id);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [open, conversation?.id, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async () => {
    const body = input.trim();
    if (!body || !conversation?.id || sending) return;

    setSending(true);
    setError(null);
    try {
      const response = await fetch(
        `${baseAPI}/api/support/live/conversations/${conversation.id}/messages/`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ body }),
        },
      );
      if (!response.ok) {
        throw new Error(ht('liveChatSendFailed'));
      }
      setInput('');
      await fetchMessages(conversation.id);
    } catch {
      setError(ht('liveChatSendFailed'));
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  const token = getAuthToken();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div className="flex h-[min(560px,85vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="flex items-center gap-2 font-bold text-slate-900">
              <MessageCircle className="h-5 w-5 text-sky-600" />
              {ht('liveChatTitle')}
            </p>
            <p className="text-xs text-slate-500">{ht('liveChatSubtitle')}</p>
            <p className="mt-1 text-xs text-sky-700">
              {ht('liveChatDoctorContext')}: {doctorName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label={ht('close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!token ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-sm text-slate-600">{ht('loginToChatSupport')}</p>
            <button
              type="button"
              onClick={() => router.push('/LoginScreenUser')}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {ht('signIn')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {loading ? (
                <p className="text-center text-sm text-slate-500">{ht('loading')}</p>
              ) : messages.length === 0 ? (
                <p className="rounded-xl bg-white p-3 text-sm text-slate-600">{ht('liveChatWelcome')}</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      message.is_staff
                        ? 'mr-auto bg-white text-slate-800 shadow-sm'
                        : 'ml-auto bg-sky-600 text-white'
                    }`}
                  >
                    <p className="mb-1 text-[11px] font-semibold opacity-80">
                      {message.is_staff ? ht('platformAdmin') : ht('you')}
                    </p>
                    <p>{message.body}</p>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {error ? <p className="px-4 text-xs text-rose-600">{error}</p> : null}

            <div className="border-t border-slate-100 p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void handleSend();
                  }}
                  placeholder={ht('liveChatPlaceholder')}
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
        )}
      </div>
    </div>
  );
}

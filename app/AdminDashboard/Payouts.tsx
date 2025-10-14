"use client";
import React, { useEffect, useState } from "react";
import { fetchAllPayouts, markPayoutCompleted, markPayoutProcessing } from "@/services/adminMarketplaceApi";

export default function PayoutsAdmin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<any[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchAllPayouts();
      setList(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onComplete = async (id: number) => {
    await markPayoutCompleted(id);
    await load();
  };
  const onProcessing = async (id: number) => {
    await markPayoutProcessing(id);
    await load();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Payouts</h2>
      <div className="space-y-3">
        {list.map((p) => (
          <div key={p.id} className="border rounded-xl p-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Parceiro {p.parceiro}</div>
              <div className="text-sm capitalize">{p.status}</div>
            </div>
            <div className="text-sm text-gray-600">{p.amount} {p.currency} · {new Date(p.requested_at).toLocaleString()}</div>
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => onProcessing(p.id)}>Processing</button>
              <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={() => onComplete(p.id)}>Complete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



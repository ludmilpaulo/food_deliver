'use client';

import React, { useEffect, useState } from 'react';

type PaymentProvider = {
  id: number;
  provider: string;
  country: string;
  active: boolean;
};

type PaymentDetailsProps = {
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
};

const COD_METHODS = [
  { value: 'Entrega', label: 'Pagar na entrega' },
  { value: 'TPA', label: 'Pagar na entrega com TPA' },
] as const;

export default function PaymentDetails({ paymentMethod, setPaymentMethod }: PaymentDetailsProps) {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_BASE_API || '';
    fetch(`${api}/api/payments/methods/?country=ZA`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) => {
        if (Array.isArray(data)) setProviders(data as PaymentProvider[]);
      })
      .catch(() => setProviders([]));
  }, []);

  return (
    <div className="mb-6">
      <label className="block text-gray-700 mb-2">Método de pagamento:</label>
      <select
        className="w-full p-2 border border-gray-300 rounded"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        {COD_METHODS.map((method) => (
          <option key={method.value} value={method.value}>
            {method.label}
          </option>
        ))}
        {providers
          .filter((p) => p.active)
          .map((p) => (
            <option key={p.id} value={p.provider}>
              {p.provider}
            </option>
          ))}
      </select>

      {paymentMethod === 'Entrega' || paymentMethod === 'TPA' ? (
        <div className="mb-6 mt-3 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          Certifique-se de ter troco suficiente ou cartão para usar o TPA.
        </div>
      ) : null}
    </div>
  );
}

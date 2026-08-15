'use client';

import React, { useEffect } from 'react';
import { useGetPaymentMethodsQuery } from '@/redux/slices/paymentsApi';
import type { AvailablePaymentMethod, BankAccount } from '@/types/payments';

type PaymentDetailsProps = {
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  proofFile: File | null;
  setProofFile: (file: File | null) => void;
};

export default function PaymentDetails({
  paymentMethod,
  setPaymentMethod,
  phone,
  setPhone,
  proofFile,
  setProofFile,
}: PaymentDetailsProps) {
  const { data, isLoading, error } = useGetPaymentMethodsQuery();
  const methods: AvailablePaymentMethod[] = data?.methods ?? [];

  useEffect(() => {
    if (!methods.length) return;
    const exists = methods.some((method) => method.code === paymentMethod);
    if (!exists) {
      setPaymentMethod(data?.default_method || methods[0].code);
    }
  }, [methods, paymentMethod, setPaymentMethod, data?.default_method]);

  const selected = methods.find((method) => method.code === paymentMethod);
  const banks: BankAccount[] = selected?.bank_accounts ?? [];

  return (
    <div className="mb-6">
      <label className="mb-2 block text-gray-700">Método de pagamento:</label>
      {isLoading ? <p className="text-sm text-slate-500">Loading payment methods…</p> : null}
      {error ? (
        <p className="text-sm text-red-600">Could not load payment methods for your country.</p>
      ) : null}
      <select
        className="w-full rounded border border-gray-300 p-2"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        {methods
          .filter((method) => method.available)
          .map((method) => (
            <option key={method.code} value={method.code}>
              {method.label}
            </option>
          ))}
      </select>

      {selected?.requires_phone ? (
        <div className="mt-3 space-y-2 rounded border-l-4 border-blue-500 bg-blue-50 p-3 text-sm text-blue-800">
          <p>Confirm this payment on your EcoCash phone. Kudya never collects your PIN.</p>
          <input
            className="w-full rounded border border-blue-200 p-2 text-slate-900"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="2637…"
            inputMode="tel"
          />
        </div>
      ) : null}

      {selected?.requires_proof && banks.length > 0 ? (
        <div className="mt-3 space-y-2 rounded border-l-4 border-amber-500 bg-amber-50 p-3 text-sm text-amber-900">
          {banks.map((bank) => (
            <div key={bank.id}>
              <p className="font-semibold">{bank.bank_name}</p>
              <p>{bank.account_name}</p>
              <p>{bank.account_number}</p>
              {bank.iban ? <p>IBAN: {bank.iban}</p> : null}
              {bank.swift_bic ? <p>SWIFT: {bank.swift_bic}</p> : null}
              {bank.payment_reference_instructions ? <p>{bank.payment_reference_instructions}</p> : null}
              {bank.additional_instructions ? <p>{bank.additional_instructions}</p> : null}
            </div>
          ))}
          <label className="mt-2 block">
            Upload proof (PDF, JPG, JPEG, PNG)
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="mt-1 block w-full"
              onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {proofFile ? <p>Selected: {proofFile.name}</p> : null}
          <p>The order stays unpaid until finance reviews the proof.</p>
        </div>
      ) : null}

      {selected?.code === 'cash' ? (
        <div className="mt-3 rounded border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
          Pay the courier on delivery.
        </div>
      ) : null}
    </div>
  );
}

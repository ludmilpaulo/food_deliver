'use client';

import React from 'react';
import { MdClose } from 'react-icons/md';

import VehicleConfigurationCard from '@/features/admin/drivers/components/VehicleConfigurationCard';

type DriverVehicleModalProps = {
  driverId: number;
  driverName: string;
  countryId?: number;
  canEdit?: boolean;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export default function DriverVehicleModal({
  driverId,
  driverName,
  countryId,
  canEdit,
  open,
  onClose,
  onSaved,
}: DriverVehicleModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-slate-50 p-4 shadow-xl sm:rounded-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-slate-200"
          aria-label="Close modal"
        >
          <MdClose className="text-xl" />
        </button>
        <VehicleConfigurationCard
          driverId={driverId}
          driverName={driverName}
          countryId={countryId}
          canEdit={canEdit}
          onSaved={() => {
            onSaved?.();
            onClose();
          }}
        />
      </div>
    </div>
  );
}

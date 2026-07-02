'use client';

import { createContext, useContext } from 'react';

const AdminSessionContext = createContext(false);

export function AdminSessionProvider({
  verified,
  children,
}: {
  verified: boolean;
  children: React.ReactNode;
}) {
  return (
    <AdminSessionContext.Provider value={verified}>{children}</AdminSessionContext.Provider>
  );
}

export function useAdminSessionVerified(): boolean {
  return useContext(AdminSessionContext);
}

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ResetPassword from './ResetPassword';

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const uid = searchParams.get('uid');

  if (!token || !uid) {
    return <div>Invalid token or user ID.</div>;
  }

  return <ResetPassword />;
};

export default ResetPasswordPage;

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { baseAPI } from '@/services/types';

const ActivateAccountPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const uid = searchParams.get('uid');

  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const response = await fetch(`${baseAPI}/conta/activate-account/${uid}/${token}/`, {
          method: 'GET',
        });

        const data = await response.json();

        if (response.ok) {
          setMessage('Conta ativada com sucesso.');
        } else {
          setMessage(data.message || 'Erro ao ativar a conta.');
        }
      } catch (error) {
        console.error('Erro ao ativar a conta:', error);
        setMessage('Erro ao ativar a conta.');
      } finally {
        setLoading(false);
      }
    };

    activateAccount();
  }, [token, uid]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-lg">
        {loading ? (
          <div className="text-center">Ativando conta...</div>
        ) : (
          <div className="text-center">{message}</div>
        )}
        <button
          onClick={() => router.push('/LoginScreenUser')}
          className="w-full py-2 px-4 mt-6 bg-indigo-700 text-white rounded hover:bg-indigo-600"
        >
          Voltar para Login
        </button>
      </div>
    </div>
  );
};

export default ActivateAccountPage;

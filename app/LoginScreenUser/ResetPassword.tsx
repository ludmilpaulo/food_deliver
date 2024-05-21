"use client";
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { baseAPI } from '@/services/types';

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const uid = searchParams.get('uid');

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${baseAPI}/conta/reset-password-confirm/${uid}/${token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Erro ao redefinir a senha.');
      }
    } catch (error) {
      console.error('Erro ao redefinir a senha:', error);
      setError('Erro ao redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-lg">
        <h2 className="text-2xl mb-6 text-center">Redefinir Senha</h2>
        {success ? (
          <div>
            <p className="mb-6 text-center">Senha redefinida com sucesso. Verifique seu email para ativar sua conta.</p>
            <button
              onClick={() => router.push('/LoginScreenUser')}
              className="w-full py-2 px-4 bg-indigo-700 text-white rounded hover:bg-indigo-600"
            >
              Fazer Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="mb-4 text-red-600">{error}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Digite sua nova senha"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Confirme a Nova Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Confirme sua nova senha"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-700 text-white rounded hover:bg-indigo-600"
              disabled={loading}
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

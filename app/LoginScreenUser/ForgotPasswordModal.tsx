"use client";
import React, { useState } from 'react';
import { baseAPI } from '@/services/types';

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ show, onClose }) => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseAPI}/conta/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
      } else {
        alert(data.message || 'Erro ao enviar o email de redefinição de senha.');
      }
    } catch (error) {
      console.error('Erro ao redefinir a senha:', error);
      alert('Erro ao enviar o email de redefinição de senha.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        {emailSent ? (
          <div>
            <h2 className="text-2xl mb-4">Email Enviado</h2>
            <p className="mb-4">Por favor, verifique seu email para redefinir sua senha.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-600"
            >
              Fechar
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl mb-4">Redefinir Senha</h2>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mt-2 mb-4 border border-gray-300 rounded"
              placeholder="Digite seu email"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-600"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;

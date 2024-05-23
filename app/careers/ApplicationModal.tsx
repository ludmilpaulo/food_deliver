"use client";
import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { baseAPI } from '@/services/api';

interface ApplicationModalProps {
  isOpen: boolean;
  closeModal: () => void;
  careerTitle: string;
  careerId: number;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  closeModal,
  careerTitle,
  careerId,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<File | null>(null);

  const handleApply = async () => {
    if (!resume) return alert('Por favor, anexe um currículo.');
    setLoading(true);
    const formData = new FormData();
    formData.append('career', String(careerId));
    formData.append('full_name', fullName);
    formData.append('email', email);
    formData.append('resume', resume);

    const response = await fetch(`${baseAPI}/careers/apply-for-job/`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      setLoading(false);
      alert('Inscrição enviada com sucesso!');
      closeModal();
    } else {
      setLoading(false);
      alert('Falha ao enviar inscrição.');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeModal}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          {/* Este elemento é para enganar o navegador e centralizar o conteúdo do modal. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Candidate-se para {careerTitle}
              </Dialog.Title>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Digite seu Nome Completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input input-bordered w-full mb-4 p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="email"
                  placeholder="Digite seu Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full mb-4 p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="file"
                  onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
                  className="file-input w-full mb-4 p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-500 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 w-full"
                  onClick={handleApply}
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Inscrição'}
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
"use client";
import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { baseAPI } from '@/services/api';
import { t } from "@/configs/i18n";
import { X } from "lucide-react"; // or use any icon lib you prefer

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
    if (!resume) return alert(t("pleaseAttachResume") || 'Por favor, anexe um currículo.');
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

    setLoading(false);
    if (response.ok) {
      alert(t("applicationSuccess") || 'Inscrição enviada com sucesso!');
      closeModal();
      setFullName('');
      setEmail('');
      setResume(null);
    } else {
      alert(t("applicationFailed") || 'Falha ao enviar inscrição.');
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

          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="relative inline-block w-full max-w-md p-7 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
              
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-red-300"
                aria-label={t("close") || "Fechar"}
              >
                <X className="w-6 h-6" />
              </button>
              
              <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-blue-800 mb-3">
                {t("applyFor") || "Candidate-se para"} {careerTitle}
              </Dialog.Title>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder={t("fullName") || "Nome Completo"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full mb-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <input
                  type="email"
                  placeholder={t("email") || "Email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mb-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <input
                  type="file"
                  onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
                  className="w-full mb-3 p-3 border border-gray-300 rounded-lg"
                  accept=".pdf,.doc,.docx"
                />
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="w-full inline-flex justify-center px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-yellow-400 rounded-xl hover:from-yellow-500 hover:to-blue-700 focus:outline-none transition"
                  onClick={handleApply}
                  disabled={loading}
                >
                  {loading ? (t("sending") || "Enviando...") : (t("submitApplication") || "Enviar Inscrição")}
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

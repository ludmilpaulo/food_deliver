"use client";
import { useState } from "react";
import { Transition } from "@headlessui/react";
import { baseAPI } from "@/services/types";
import { t } from "@/configs/i18n";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    subject: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const response = await fetch(`${baseAPI}/info/contacts/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    setLoading(false);
    if (response.ok) {
      setFormData({
        subject: "",
        email: "",
        phone: "",
        message: "",
      });
      setSuccess(t("contactSuccess") || "Mensagem enviada com sucesso! Verifique seu e-mail para confirmação.");
    } else {
      setError(t("contactFailed") || "Falha ao enviar a mensagem. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-blue-50 to-blue-300 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white/90 backdrop-blur p-8 rounded-2xl shadow-2xl max-w-lg w-full space-y-7 border border-blue-100"
      >
        <h2 className="text-3xl font-extrabold mb-2 text-blue-800 text-center tracking-tight">
          {t("contactUs") || "Contacte-nos"}
        </h2>
        <p className="text-center text-gray-500 mb-3">
          {t("contactSubtitle") ||
            "Envie sua mensagem, sugestão ou dúvida. Nossa equipa irá responder rapidamente!"}
        </p>

        {/* Success/Error banners */}
        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded-md text-sm text-center mb-2 border border-green-300">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md text-sm text-center mb-2 border border-red-300">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-blue-800 mb-1">
            {t("subject") || "Assunto"}
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            autoComplete="off"
            value={formData.subject}
            onChange={handleChange}
            required
            className="mt-1 p-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            placeholder={t("subjectPlaceholder") || "Como podemos ajudar?"}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-blue-800 mb-1">
            {t("email") || "Email"}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="off"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 p-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            placeholder={t("emailPlaceholder") || "seu@email.com"}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-blue-800 mb-1">
            {t("phone") || "Telefone"}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="off"
            value={formData.phone}
            onChange={handleChange}
            required
            className="mt-1 p-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            placeholder={t("phonePlaceholder") || "+244 912 345 678"}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-blue-800 mb-1">
            {t("message") || "Mensagem"}
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="mt-1 p-3 border border-gray-200 rounded-lg w-full h-32 resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            placeholder={t("messagePlaceholder") || "Escreva sua mensagem..."}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-gradient-to-r from-blue-600 to-yellow-400 hover:from-yellow-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition text-lg shadow-lg ${loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
        >
          {loading ? (
            <span>{t("sending") || "Enviando..."}</span>
          ) : (
            <span>{t("send") || "Enviar"}</span>
          )}
        </button>

        {/* Loader overlay */}
        <Transition
          show={loading}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
          </div>
        </Transition>
      </form>
    </div>
  );
};

export default ContactForm;

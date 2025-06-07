"use client";
import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import axios from "axios";
import { baseAPI } from "@/services/api";
import { t } from "@/configs/i18n";

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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [language, setLanguage] = useState<"en" | "pt">("en");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) {
      alert(t("pleaseAttachResume") || "Please attach your resume.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("career_id", String(careerId));
      formData.append("full_name", fullName);
      formData.append("email", email);
      formData.append("cover_letter", coverLetter);
      formData.append("language", language);
      formData.append("resume", resume);

      const response = await axios.post(`${baseAPI}/careers/job-applications/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLoading(false);
      if (response.status === 201 || response.status === 200) {
        alert(t("applicationSuccess") || "Application submitted successfully!");
        closeModal();
        setFullName("");
        setEmail("");
        setCoverLetter("");
        setResume(null);
        setLanguage("en");
      } else {
        alert(t("applicationFailed") || "Failed to submit application.");
      }
    } catch (err) {
      setLoading(false);
      alert(t("applicationFailed") || "Failed to submit application.");
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-2xl font-bold">
                    {careerTitle}
                  </Dialog.Title>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 transition">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Language Selector */}
                  <div>
                    <label className="block text-sm font-medium">{t("language") || "Language"}</label>
                    <select
                      className="border p-2 rounded w-full"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as "en" | "pt")}
                    >
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium">{t("fullName") || "Full Name"}</label>
                    <input
                      type="text"
                      className="w-full border p-2 rounded"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium">{t("email") || "Email"}</label>
                    <input
                      type="email"
                      className="w-full border p-2 rounded"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-medium">{t("coverLetter") || "Cover Letter"}</label>
                    <textarea
                      className="w-full border p-2 rounded"
                      rows={5}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      required
                    />
                  </div>

                  {/* Resume */}
                  <div>
                    <label className="block text-sm font-medium">{t("resume") || "Resume"}</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="w-full border p-2 rounded"
                      onChange={(e) => setResume(e.target.files?.[0] || null)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? (t("loading") || "Loading...") : (t("submit") || "Submit")}
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

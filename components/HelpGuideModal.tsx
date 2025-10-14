"use client";
import React, { useState } from 'react';
import { X, HelpCircle, ChevronDown } from 'lucide-react';

interface HelpSection {
  title: string;
  content: string;
  steps?: string[];
}

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: HelpSection[];
  title?: string;
}

const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  sections,
  title = 'Guia de Ajuda',
}) => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  if (!isOpen) return null;

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <HelpCircle className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {sections.map((section, index) => (
            <div key={index} className="mb-4 border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-800">{section.title}</span>
                <ChevronDown
                  size={20}
                  className={`text-blue-600 transition-transform ${
                    expandedSection === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSection === index && (
                <div className="p-4 bg-white">
                  <p className="text-gray-600 mb-3">{section.content}</p>
                  {section.steps && section.steps.length > 0 && (
                    <div className="space-y-3">
                      {section.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                            {stepIndex + 1}
                          </div>
                          <p className="text-gray-700 flex-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpGuideModal;


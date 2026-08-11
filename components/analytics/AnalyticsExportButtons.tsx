"use client";

import {
  buildAnalyticsCsv,
  buildAnalyticsPrintHtml,
  type AnalyticsExportPayload,
} from "@/utils/analyticsExport";

type Props = {
  payload: AnalyticsExportPayload;
  exportCsvLabel?: string;
  exportPdfLabel?: string;
};

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function AnalyticsExportButtons({
  payload,
  exportCsvLabel = "Export CSV",
  exportPdfLabel = "Export PDF",
}: Props) {
  const safeName = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "analytics";

  const handleCsv = () => {
    downloadBlob(`${safeName}.csv`, buildAnalyticsCsv(payload), "text/csv;charset=utf-8");
  };

  const handlePdf = () => {
    const html = buildAnalyticsPrintHtml(payload);
    const popup = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!popup) {
      downloadBlob(`${safeName}.html`, html, "text/html;charset=utf-8");
      return;
    }
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleCsv}
        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        {exportCsvLabel}
      </button>
      <button
        type="button"
        onClick={handlePdf}
        className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100"
      >
        {exportPdfLabel}
      </button>
    </div>
  );
}

// components/PremiumPaginator.tsx
import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const PremiumPaginator: React.FC<Props> = ({ page, totalPages, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [jumpVal, setJumpVal] = useState("");

  // Jump to page logic
  const jumpToPage = () => {
    const val = parseInt(jumpVal, 10);
    if (val > 0 && val <= totalPages && val !== page) {
      onChange(val);
      setJumpVal("");
    }
  };

  return (
    <div className="w-full flex flex-col items-center mt-8 mb-6">
      <div className="flex items-center gap-4 bg-white rounded-2xl shadow-lg px-6 py-3">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className={`p-2 rounded-full bg-blue-100 hover:bg-blue-700 hover:text-white text-blue-700 transition shadow-md disabled:opacity-30 disabled:cursor-not-allowed`}
          aria-label="Previous"
        >
          <ChevronLeft size={22} />
        </button>
        <span className="text-lg font-semibold tracking-wide px-2">
          {page} <span className="opacity-70 text-base">/</span> {totalPages}
        </span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className={`p-2 rounded-full bg-blue-100 hover:bg-blue-700 hover:text-white text-blue-700 transition shadow-md disabled:opacity-30 disabled:cursor-not-allowed`}
          aria-label="Next"
        >
          <ChevronRight size={22} />
        </button>
        {/* Jump to page */}
        <div className="flex items-center gap-2 ml-4">
          <input
            ref={inputRef}
            type="number"
            min={1}
            max={totalPages}
            value={jumpVal}
            onChange={e => setJumpVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && jumpToPage()}
            className="w-12 px-2 py-1 text-center rounded border border-gray-200 shadow-inner outline-none focus:ring-2 focus:ring-blue-300 transition"
            placeholder="Pg"
            style={{ fontVariantNumeric: "tabular-nums" }}
          />
          <button
            onClick={jumpToPage}
            className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white shadow transition"
            aria-label="Go to page"
            disabled={
              !jumpVal ||
              isNaN(Number(jumpVal)) ||
              Number(jumpVal) < 1 ||
              Number(jumpVal) > totalPages ||
              Number(jumpVal) === page
            }
          >
            <MoveRight size={18} />
          </button>
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {`Mostrando ${page} de ${totalPages} páginas`}
      </div>
    </div>
  );
};

export default PremiumPaginator;

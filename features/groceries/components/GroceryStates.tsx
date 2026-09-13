'use client';

export function GroceryEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-white px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
      <p className="mt-2 text-sm text-[#6B7280]">{description}</p>
    </div>
  );
}

export function GroceryErrorState({
  title,
  description,
  retryLabel,
  onRetry,
}: {
  title: string;
  description: string;
  retryLabel: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-white px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
      <p className="mt-2 text-sm text-[#6B7280]">{description}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#0B8F45] px-5 text-sm font-semibold text-white hover:bg-[#056B34]"
      >
        {retryLabel}
      </button>
    </div>
  );
}

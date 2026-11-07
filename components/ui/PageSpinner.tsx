"use client";

type PageSpinnerProps = {
  color?: "blue" | "green";
  fullPage?: boolean;
};

export default function PageSpinner({ color = "blue", fullPage = false }: PageSpinnerProps) {
  const ring =
    color === "green"
      ? "border-[#EAF7EE] border-t-[#0B8F45]"
      : "border-slate-200 border-t-blue-600";

  return (
    <div
      className={`flex w-full items-center justify-center ${fullPage ? "min-h-screen" : "min-h-[40vh]"}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className={`h-14 w-14 animate-spin rounded-full border-[3px] ${ring}`} />
      <span className="sr-only">Loading</span>
    </div>
  );
}

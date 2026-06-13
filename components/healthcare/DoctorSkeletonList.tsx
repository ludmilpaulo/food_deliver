export default function DoctorSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="h-20 w-20 rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
              <div className="h-6 w-28 rounded-full bg-sky-100" />
              <div className="h-3 w-2/3 rounded bg-slate-100" />
            </div>
            <div className="h-5 w-14 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

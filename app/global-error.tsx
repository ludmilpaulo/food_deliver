'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h2 className="text-xl font-semibold">Application error</h2>
        <p className="text-slate-600">Kudya encountered an unexpected problem.</p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="max-w-lg overflow-auto rounded bg-slate-100 p-3 text-left text-xs">
            {error.message}
          </pre>
        )}
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Reload
        </button>
      </body>
    </html>
  );
}

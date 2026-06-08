"use client";

type ExportButtonProps = {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
};

export function ExportButton({ disabled, loading, onClick }: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-sky-400/35 bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-slate-700"
    >
      {loading ? "Preparing Excel..." : "Export to Excel"}
    </button>
  );
}
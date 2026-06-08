"use client";

type FolderInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
};

export function FolderInput({
  value,
  onChange,
  onSubmit,
  loading,
  disabled,
}: FolderInputProps) {
  return (
    <form
      className="flex flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-[color:var(--surface)] p-4 shadow-2xl shadow-slate-950/25 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="text-sm font-medium text-slate-100" htmlFor="folder-url">
        Google Drive folder link
      </label>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          id="folder-url"
          type="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://drive.google.com/drive/folders/..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-50 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
        />
        <button
          type="submit"
          disabled={disabled || loading}
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {loading ? "Loading..." : "Extract Files"}
        </button>
      </div>
      <p className="text-xs leading-5 text-slate-400">
        Supports standard Drive folder URLs, shared links, and /drive/u/0/folders/ URLs.
      </p>
    </form>
  );
}
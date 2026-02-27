export default function AdminLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
      {/* Pulsing rings */}
      <div className="relative flex flex-col items-center">
        <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-brand-100 animate-ping opacity-20" />
        <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-brand-100 animate-pulse opacity-40" />

        {/* Brand logo */}
        <div className="relative z-10 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
          <span className="text-5xl sm:text-6xl font-extrabold text-brand select-none">
            स्त्री
          </span>
        </div>
      </div>

      {/* Admin badge */}
      <div className="mt-8 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand text-xs font-bold rounded-full uppercase tracking-wider border border-brand-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          Admin Panel
        </span>
      </div>

      {/* Tagline */}
      <p className="mt-4 text-sm text-muted font-medium tracking-wide animate-pulse">
        Loading dashboard&hellip;
      </p>

      {/* Spinner bar */}
      <div className="mt-5 w-48 h-[3px] bg-brand-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand rounded-full animate-loader-bar" />
      </div>
    </div>
  );
}


export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      {/* Pulsing brand name */}
      <div className="relative flex flex-col items-center">
        {/* Decorative ring */}
        <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-brand-100 animate-ping opacity-30" />
        <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-brand-100 animate-pulse opacity-50" />

        {/* Brand logo */}
        <div className="relative z-10 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
          <span className="text-5xl sm:text-6xl font-extrabold text-brand select-none">
            स्त्री
          </span>
        </div>
      </div>

      {/* Tagline */}
      <p className="mt-10 text-sm sm:text-base text-muted font-medium tracking-wide animate-pulse">
        Beautiful sarees loading&hellip;
      </p>

      {/* Spinner bar */}
      <div className="mt-6 w-48 h-[3px] bg-brand-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand rounded-full animate-loader-bar" />
      </div>
    </div>
  );
}


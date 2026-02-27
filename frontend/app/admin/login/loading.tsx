export default function AdminLoginLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      <div className="relative flex flex-col items-center">
        <div className="absolute w-32 h-32 rounded-full border-2 border-brand-100 animate-ping opacity-20" />
        <div className="absolute w-24 h-24 rounded-full border border-brand-100 animate-pulse opacity-40" />
        <div className="relative z-10 flex items-center justify-center w-20 h-20">
          <span className="text-4xl font-extrabold text-brand select-none">
            स्त्री
          </span>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted font-medium animate-pulse">
        Loading&hellip;
      </p>
      <div className="mt-4 w-40 h-[3px] bg-brand-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand rounded-full animate-loader-bar" />
      </div>
    </div>
  );
}


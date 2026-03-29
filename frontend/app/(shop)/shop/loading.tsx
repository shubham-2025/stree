export default function ShopLoading() {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-7xl flex-col items-center justify-center px-4 py-16">
      <div className="h-3 w-48 animate-pulse rounded-full bg-brand-100" />
      <p className="mt-4 text-sm text-muted">Loading collection&hellip;</p>
    </div>
  );
}

import AdminNav from "@/components/AdminNav";
import { ToastProvider } from "@/components/ToastProvider";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface-alt">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}


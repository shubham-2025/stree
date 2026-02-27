import LoginForm from "./LoginForm";

export const metadata = {
  title: "Admin Login — स्त्री",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand">स्त्री</h1>
          <p className="text-sm text-muted mt-2">Admin Panel</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}


import { Outlet } from "react-router-dom";
import logo from "../assets/header/logo.png";

export default function AuthLayout() {
  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="Sansaland" className="h-16 w-16 rounded-full shadow-card" />
          <div className="mt-3 text-sm font-medium text-ink-muted">Sansaland Admin</div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-8">
          <Outlet />
        </div>
        <p className="mt-6 text-center text-xs text-ink-subtle">
          © {new Date().getFullYear()} Sansaland. Admin access only.
        </p>
      </div>
    </div>
  );
}

export function AuthHeading({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="m-0 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      {subtitle && <p className="m-0 mt-1.5 text-sm text-ink-muted">{subtitle}</p>}
    </div>
  );
}

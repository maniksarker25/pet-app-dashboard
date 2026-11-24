import { NavLink } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import logo from "../assets/header/logo.png";
import { NAV_SECTIONS } from "./navItems";

export default function Sidebar({ onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 px-5 py-5">
        <img src={logo} alt="" className="h-10 w-10 rounded-full" />
        <div className="leading-tight">
          <div className="text-base font-semibold text-ink">Sansaland</div>
          <div className="text-xs text-ink-muted">Admin console</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mt-4 first:mt-1">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
              {section.title}
            </div>
            <ul className="m-0 list-none space-y-0.5 p-0">
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-colors ${
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-ink"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`text-lg ${isActive ? "text-brand-600" : "text-gray-400"}`} />
                        <span className="truncate">{label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-0 border-t border-solid border-gray-100 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
        >
          <LuLogOut className="text-lg" />
          Sign out
        </button>
      </div>
    </div>
  );
}

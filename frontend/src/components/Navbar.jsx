import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Bell,
  User,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Beranda", icon: LayoutDashboard },
  { to: "/pos", label: "Kasir", icon: ShoppingCart },
  { to: "/items", label: "Barang", icon: Package },
  { to: "/transactions", label: "Riwayat", icon: Receipt },
];

export default function Navbar() {
  const location = useLocation();

  // Page titles
  const titles = {
    "/": "Dasbor",
    "/pos": "Sistem Kasir",
    "/items": "Inventaris",
    "/transactions": "Riwayat",
  };

  return (
    <>
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-extrabold text-[var(--color-text)] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Kasir<span className="text-[var(--color-primary)]">Keren</span>
            </h1>
            <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.15em] mt-0.5">
              {titles[location.pathname] || "Sistem Kasir"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-2xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-secondary)] active:scale-95 transition-transform">
              <Bell size={18} />
            </button>
            <button className="w-10 h-10 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center text-white active:scale-95 transition-transform">
              <User size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-2 pb-2 pt-1">
        <div className="flex items-center justify-around">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all active:scale-95"
              >
                <div
                  className={`w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white shadow-lg shadow-indigo-500/30"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-[10px] font-semibold transition-colors ${
                    isActive
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}

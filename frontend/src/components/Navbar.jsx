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

const titles = {
  "/": "Dasbor",
  "/pos": "Sistem Kasir",
  "/items": "Inventaris",
  "/transactions": "Riwayat",
};

export default function Navbar() {
  const location = useLocation();
  const currentTitle = titles[location.pathname] || "Sistem Kasir";

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl px-4 pt-4 pb-3 sm:px-5 lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-extrabold text-[var(--color-text)] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Kasir<span className="text-[var(--color-primary)]">Keren</span>
            </h1>
            <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.15em] mt-0.5">
              {currentTitle}
            </p>
          </div>
          <ActionButtons />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-80 bg-white/90 backdrop-blur-xl border-r border-slate-100 px-5 py-6 flex-col">
        <div className="px-2 mb-8">
          <h1
            className="text-2xl font-extrabold text-[var(--color-text)] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Kasir<span className="text-[var(--color-primary)]">Keren</span>
          </h1>
          <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mt-1">
            Digital Concierge POS
          </p>
        </div>

        <nav className="space-y-2.5">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all active:scale-[0.98] ${
                  isActive
                    ? "bg-[var(--color-primary-ultra-light)] text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white shadow-lg shadow-indigo-500/30"
                      : "bg-white text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]"
                  }`}
                >
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold tracking-tight">{label}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] font-semibold opacity-75">
                    {to === "/" ? "Insights" : to === "/pos" ? "Point Of Sale" : to === "/items" ? "Catalog" : "Records"}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl bg-[var(--color-primary)] text-white p-4 shadow-lg shadow-indigo-500/30">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-semibold">Current View</p>
          <p className="text-lg font-bold tracking-tight mt-1">{currentTitle}</p>
        </div>
      </aside>

      {/* Desktop Top Context Bar */}
      <header className="hidden lg:flex fixed top-0 left-80 right-0 z-40 h-[5.5rem] items-center justify-between px-8 bg-[var(--color-surface)]/85 backdrop-blur-xl border-b border-slate-100">
        <div>
          <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
            Operational Records
          </p>
          <h2
            className="text-2xl font-extrabold tracking-tight text-[var(--color-text)] mt-0.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {currentTitle}
          </h2>
        </div>
        <ActionButtons />
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-t border-slate-100 px-2 pb-2 pt-1 lg:hidden">
        <div className="mx-auto w-full max-w-xl flex items-center justify-around">
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

function ActionButtons() {
  return (
    <div className="flex items-center gap-2">
      <button className="w-10 h-10 rounded-2xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-secondary)] active:scale-95 transition-transform">
        <Bell size={18} />
      </button>
      <button className="w-10 h-10 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center text-white active:scale-95 transition-transform">
        <User size={18} />
      </button>
    </div>
  );
}

import { useEffect, useState } from "react";
import api from "../api/axios";
import SalesChart from "../components/SalesChart";
import { TrendingUp, ShoppingBag, ArrowUpRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [stats, setStats] = useState({ total_revenue: 0, total_orders: 0, top_items: [] });
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, chartRes] = await Promise.all([
          api.get("/dashboard/today"),
          api.get("/dashboard/chart"),
        ]);
        setStats(statsRes.data);
        setChart(chartRes.data);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatRp = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-3 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="space-y-5 lg:space-y-6 animate-fade-in">
      <div className="hidden lg:flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
            Daily Insights
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
            Ringkasan Penjualan
          </h2>
        </div>
        <button
          onClick={() => navigate("/pos")}
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-transform"
        >
          <Plus size={16} />
          New Order
        </button>
      </div>

      <div className="grid gap-4 lg:gap-5 lg:grid-cols-12">
        <div
          className="relative overflow-hidden rounded-3xl p-6 text-white lg:col-span-7"
          style={{
            background: "linear-gradient(135deg, #2E44A7 0%, #5b6fd4 50%, #7c8de8 100%)",
            boxShadow: "0 8px 32px rgba(46, 68, 167, 0.35)",
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70 mb-1">
            Pendapatan Hari Ini
          </p>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            {formatRp(stats.total_revenue)}
          </h2>
          <div className="flex items-center gap-1 mt-2 text-white/80 text-xs font-medium">
            <ArrowUpRight size={14} />
            <span>Keuntungan Laba: {formatRp(stats.total_profit || 0)}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-white/70 text-[10px] font-medium">
            • {stats.total_orders} pesanan hari ini
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:col-span-5">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-ultra-light)] flex items-center justify-center mb-2">
              <TrendingUp size={18} className="text-[var(--color-primary)]" />
            </div>
            <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Omzet
            </p>
            <p className="text-lg font-bold text-[var(--color-text)] tracking-tight mt-0.5">
              {formatRp(stats.total_revenue)}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[var(--color-success-light)]/30">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-success-light)] flex items-center justify-center mb-2">
              <TrendingUp size={18} className="text-[var(--color-success)] rotate-45" />
            </div>
            <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Laba / Profit
            </p>
            <p className="text-lg font-bold text-[var(--color-success)] tracking-tight mt-0.5">
              {formatRp(stats.total_profit || 0)}
            </p>
            <p className="text-[8px] font-bold text-[var(--color-text-muted)] mt-1 uppercase">
              (Jual - Modal)
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm col-span-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center">
                <ShoppingBag size={18} className="text-[var(--color-text-secondary)]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Total Pesanan
                </p>
                <p className="text-lg font-bold text-[var(--color-text)] tracking-tight mt-0.5">
                  {stats.total_orders}{" "}
                  <span className="text-[10px] font-medium text-[var(--color-text-muted)] ml-1">Transaksi</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:gap-5 lg:grid-cols-2">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-3">Tren Penjualan</h3>
          <SalesChart data={chart} />
        </div>

        {stats.top_items.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[var(--color-text)] mb-3">Produk Terlaris</h3>
            <div className="space-y-2.5">
              {stats.top_items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[var(--color-primary-ultra-light)] flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-text)] truncate">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] px-2.5 py-1 rounded-lg">
                    {item.qty} terjual
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Mobile FAB — New Order */}
      <div className="fixed bottom-24 right-5 pointer-events-none z-40 lg:hidden">
        <button
          onClick={() => navigate("/pos")}
          className="w-14 h-14 rounded-2xl bg-[var(--color-primary)] text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center active:scale-90 transition-transform pointer-events-auto"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

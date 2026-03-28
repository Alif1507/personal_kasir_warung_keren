import { useEffect, useState } from "react";
import api from "../api/axios";
import { Receipt, X } from "lucide-react";
import toast from "react-hot-toast";
import PopupModal from "../components/PopupModal";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api
      .get("/transactions")
      .then((r) => setTransactions(r.data))
      .catch(() => toast.error("Failed to load transactions"))
      .finally(() => setLoading(false));
  }, []);

  const formatRp = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const statusColor = (s) => {
    if (s === "success") return "bg-[var(--color-success)] text-white";
    if (s === "pending") return "bg-[var(--color-warning)] text-white";
    return "bg-[var(--color-error)] text-white";
  };

  const groupByDate = (txs) => {
    const groups = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    txs.forEach((tx) => {
      const d = new Date(tx.created_at);
      const ds = d.toDateString();
      let label;
      if (ds === today) label = "Hari Ini";
      else if (ds === yesterday) label = "Kemarin";
      else label = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-3 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  const groups = groupByDate(transactions);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-4 lg:mb-6">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-[var(--color-text)] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Riwayat
        </h2>
        <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.15em] mt-1">
          Catatan Operasional
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-16">
          <Receipt size={40} className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-40" />
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([label, txs]) => (
            <div key={label}>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-1">
                {label}
              </p>
              <div className="space-y-2.5">
                {txs.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => setSelected(tx)}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-[var(--color-text)] truncate">
                          {tx.order_id}
                        </h4>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${statusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {new Date(tx.created_at).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                        {tx.payment_type ? ` · ${tx.payment_type}` : ""}
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-[var(--color-text)] tracking-tight ml-3">
                      {formatRp(tx.total_amount)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <PopupModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        panelClassName="lg:max-w-2xl"
      >
        {selected && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)] tracking-tight">
                  {selected.order_id}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {new Date(selected.created_at).toLocaleString("en")}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-secondary)] active:scale-95 transition-transform"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg ${statusColor(selected.status)}`}>
                {selected.status}
              </span>
              {selected.payment_type && (
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] px-2 py-0.5 rounded-lg uppercase">
                  {selected.payment_type}
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {(selected.transaction_items || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-[var(--color-surface)] rounded-xl p-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{item.item_name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {item.quantity} × {formatRp(item.unit_price)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-text)]">{formatRp(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="border border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-text-secondary)]">Total</span>
              <span className="text-xl font-extrabold text-[var(--color-text)] tracking-tight">
                {formatRp(selected.total_amount)}
              </span>
            </div>
          </>
        )}
      </PopupModal>
    </div>
  );
}

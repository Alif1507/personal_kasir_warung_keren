import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Cart({
  cart,
  onUpdateQty,
  onRemove,
  onClear,
  total,
  onClose = () => {},
}) {
  const [method, setMethod] = useState("cash");

  const formatRp = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      // Create transaction
      const txRes = await api.post("/transactions", {
        total_amount: total,
        items: cart.map((c) => ({
          id: c.id,
          name: c.name,
          price: c.price,
          purchase_price: Number(c.purchase_price ?? 0),
          quantity: c.quantity,
        })),
      });

      const { order_id } = txRes.data;

      if (method === "cash") {
        try {
          await api.post(`/payment/success/${order_id}?payment_type=Tunai`);
          toast.success("Pembayaran tunai berhasil! 🎉");
          onClear();
          onClose();
        } catch (err) {
          toast.error("Gagal memproses pembayaran tunai");
        }
        return;
      }

      // Create Snap token
      const tokenRes = await api.post("/payment/create-token", {
        order_id,
        item_details: cart.map((c) => ({
          id: String(c.id),
          name: c.name,
          price: c.price,
          quantity: c.quantity,
        })),
      });

      // Open Midtrans snap
      if (window.snap) {
        window.snap.pay(tokenRes.data.snap_token, {
          onSuccess: async () => {
            try {
              // Notify backend since webhook cannot reach localhost
              await api.post(`/payment/success/${order_id}`);
            } catch (err) {
              console.error("Failed to confirm payment on backend");
            }
            toast.success("Pembayaran berhasil! 🎉");
            onClear();
            onClose();
          },
          onPending: () => {
            toast("Menunggu pembayaran...", { icon: "⏳" });
            onClear();
            onClose();
          },
          onError: () => toast.error("Pembayaran gagal"),
          onClose: () => toast("Pembayaran dibatalkan", { icon: "❌" }),
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Gagal memproses");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm font-semibold text-[var(--color-text-muted)]">Keranjang kosong</p>
      </div>
    );
  }

  return (
    <div>
      {/* Cart Items */}
      <div className="space-y-3 mb-5">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-[var(--color-surface)] rounded-2xl p-3"
          >
            {/* Image */}
            <div className="w-14 h-14 rounded-xl bg-[var(--color-surface-muted)] overflow-hidden flex-shrink-0">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[var(--color-text)] truncate">
                {item.name}
              </h4>
              <p className="text-xs font-semibold text-[var(--color-primary)] mt-0.5">
                {formatRp(item.price)}
              </p>
            </div>

            {/* Qty controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateQty(item.id, -1)}
                className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[var(--color-text-secondary)] active:scale-90 transition-transform shadow-sm"
              >
                <Minus size={12} />
              </button>
              <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
              <button
                onClick={() => onUpdateQty(item.id, 1)}
                disabled={item.quantity >= Number(item.stock ?? 0)}
                className="w-7 h-7 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Delete */}
            <button
              onClick={() => onRemove(item.id)}
              className="w-7 h-7 rounded-lg bg-[var(--color-error-light)] flex items-center justify-center text-[var(--color-error)] active:scale-90 transition-transform"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Total + Checkout */}
      <div className="border-t border-slate-100 pt-4 pb-2 space-y-3">
        <div className="grid grid-cols-2 gap-3 mb-2">
          <button
            onClick={() => setMethod("cash")}
            className={`py-3 rounded-2xl text-sm font-bold border-2 transition-all ${
              method === "cash"
                ? "border-[var(--color-primary)] bg-[var(--color-primary-ultra-light)] text-[var(--color-primary)]"
                : "border-slate-100 bg-white text-[var(--color-text-secondary)] hover:bg-slate-50"
            }`}
          >
            Tunai
          </button>
          <button
            onClick={() => setMethod("midtrans")}
            className={`py-3 rounded-2xl text-sm font-bold border-2 transition-all ${
              method === "midtrans"
                ? "border-[var(--color-primary)] bg-[var(--color-primary-ultra-light)] text-[var(--color-primary)]"
                : "border-slate-100 bg-white text-[var(--color-text-secondary)] hover:bg-slate-50"
            }`}
          >
            Midtrans
          </button>
        </div>

        <div className="flex items-center justify-between pointer-events-none">
          <span className="text-sm font-semibold text-[var(--color-text-secondary)]">Total</span>
          <span className="text-xl font-extrabold text-[var(--color-text)] tracking-tight">{formatRp(total)}</span>
        </div>
        <button
          onClick={handleCheckout}
          className="w-full py-4 rounded-2xl bg-[var(--color-primary)] text-white text-sm font-bold active:scale-[0.98] transition-transform shadow-lg shadow-indigo-500/25"
        >
          Bayar
        </button>
        <button
          onClick={onClear}
          className="w-full py-3 rounded-2xl bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] text-sm font-semibold active:scale-[0.98] transition-transform"
        >
          Kosongkan
        </button>
      </div>
    </div>
  );
}

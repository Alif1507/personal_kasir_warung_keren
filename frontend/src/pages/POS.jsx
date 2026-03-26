import { useEffect, useState } from "react";
import api from "../api/axios";
import ItemCard from "../components/ItemCard";
import Cart from "../components/Cart";
import { Search, ShoppingBag, X } from "lucide-react";
import toast from "react-hot-toast";

export default function POS() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    api
      .get("/items")
      .then((r) => setItems(r.data))
      .catch(() => toast.error("Failed to load items"))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added`, { duration: 1200 });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c.id !== id));
  const clearCart = () => setCart([]);
  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-3 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="text"
          placeholder="Cari barang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition"
        />
      </div>

      {/* Item Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-40" />
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">Barang tidak ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} onAdd={addToCart} />
          ))}
        </div>
      )}

      {/* Quick Cart Summary — floating bottom sheet trigger */}
      {cart.length > 0 && !showCart && (
        <div className="fixed top-[169%] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pointer-events-none z-40">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-[var(--color-primary)] text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-transform animate-slide-up pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingBag size={18} />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white/70">
                  {cart.reduce((s, c) => s + c.quantity, 0)} barang
                </p>
                <p className="text-base font-bold tracking-tight">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(total)}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold">Lihat Keranjang →</span>
          </button>
        </div>
      )}

      {/* Cart Bottom Sheet */}
      {showCart && (
        <div className="fixed top-100 inset-0 z-50">
          <div
            className="absolute top-100 inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-8 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--color-text)] tracking-tight">Keranjang Anda</h2>
              <button
                onClick={() => setShowCart(false)}
                className="w-8 h-8 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-secondary)] active:scale-95 transition-transform"
              >
                <X size={16} />
              </button>
            </div>
            <Cart
              cart={cart}
              onUpdateQty={updateQty}
              onRemove={removeFromCart}
              onClear={clearCart}
              total={total}
              onClose={() => setShowCart(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Package(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  );
}

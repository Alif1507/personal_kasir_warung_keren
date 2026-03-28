import { useEffect, useState } from "react";
import api from "../api/axios";
import { Plus, Pencil, Trash2, X, Package } from "lucide-react";
import toast from "react-hot-toast";
import PopupModal from "../components/PopupModal";

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", purchase_price: "", stock: "", sku: "", image_url: "" });

  const fetchItems = () => {
    api
      .get("/items")
      .then((r) => setItems(r.data))
      .catch(() => toast.error("Failed to load items"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", price: "", purchase_price: "", stock: "", sku: "", image_url: "" });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      price: String(item.price),
      purchase_price: String(item.purchase_price || 0),
      stock: String(item.stock),
      sku: item.sku || "",
      image_url: item.image_url || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sellPrice = Number(form.price);
    const buyPrice = Number(form.purchase_price);

    if (sellPrice < buyPrice) {
      toast.error("Harga jual tidak boleh lebih kecil dari harga beli");
      return;
    }

    const payload = {
      name: form.name,
      price: sellPrice,
      purchase_price: buyPrice,
      stock: Number(form.stock),
      sku: form.sku || null,
      image_url: form.image_url || null,
    };

    try {
      if (editing) {
        await api.put(`/items/${editing.id}`, payload);
        toast.success("Item updated");
      } else {
        await api.post("/items", payload);
        toast.success("Item created");
      }
      setShowModal(false);
      fetchItems();
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to save item");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/items/${id}`);
      toast.success("Item deleted");
      fetchItems();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post("/items/upload-image", fd);
      setForm((p) => ({ ...p, image_url: res.data.image_url }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    }
  };

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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Inventaris
          </h2>
          <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">
            {items.length} barang
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--color-primary)] text-white text-xs font-bold active:scale-95 transition-transform shadow-lg shadow-indigo-500/25"
        >
          <Plus size={14} />
          Tambah Barang
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-40" />
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">Belum ada barang</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Ketuk "Tambah Barang" untuk mulai</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const inStock = item.stock > 0;
            const lowStock = item.stock > 0 && item.stock <= 5;
            return (
              <div key={item.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-[var(--color-surface-muted)] overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[var(--color-text)] truncate">{item.name}</h3>
                    {!inStock ? (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-[var(--color-error)] text-white flex-shrink-0">Habis</span>
                    ) : lowStock ? (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-[var(--color-warning)] text-white flex-shrink-0">Sedikit</span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-[var(--color-success)] text-white flex-shrink-0">Tersedia</span>
                    )}
                  </div>
                  <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">
                    {item.sku || "NO SKU"} · Stok: {item.stock}
                  </p>
                  <p className="text-sm font-extrabold text-[var(--color-primary)] mt-1 tracking-tight">
                    {formatRp(item.price)}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => openEdit(item)}
                    className="w-8 h-8 rounded-xl bg-[var(--color-primary-ultra-light)] flex items-center justify-center text-[var(--color-primary)] active:scale-90 transition-transform"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-xl bg-[var(--color-error-light)] flex items-center justify-center text-[var(--color-error)] active:scale-90 transition-transform"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PopupModal
        open={showModal}
        onClose={() => setShowModal(false)}
        panelClassName="lg:max-w-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[var(--color-text)] tracking-tight">
            {editing ? "Edit Barang" : "Barang Baru"}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="w-8 h-8 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-secondary)] active:scale-95 transition-transform"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Nama barang"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Harga Jual"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              min="0"
              className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              required
            />
            <input
              type="number"
              placeholder="Harga Modal"
              value={form.purchase_price}
              onChange={(e) => setForm((p) => ({ ...p, purchase_price: e.target.value }))}
              min="0"
              className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              required
            />
          </div>
          <input
            type="number"
            placeholder="Stok"
            value={form.stock}
            onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
            min="0"
            className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            required
          />
          <input
            type="text"
            placeholder="SKU (optional)"
            value={form.sku}
            onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
            className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Gambar
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[var(--color-primary-ultra-light)] file:text-[var(--color-primary)] file:font-semibold file:text-xs"
            />
            {form.image_url && (
              <img src={form.image_url} alt="Preview" className="w-16 h-16 rounded-xl mt-2 object-cover" />
            )}
          </div>
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-[var(--color-primary)] text-white text-sm font-bold active:scale-[0.98] transition-transform shadow-lg shadow-indigo-500/25 mt-2"
          >
            {editing ? "Simpan Perubahan" : "Buat Barang"}
          </button>
        </form>
      </PopupModal>
    </div>
  );
}

export default function ItemCard({ item, onAdd }) {
  const formatRp = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const inStock = item.stock > 0;
  const lowStock = item.stock > 0 && item.stock <= 5;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-[0.97] transition-transform">
      {/* Image */}
      <div className="relative aspect-square bg-[var(--color-surface-muted)]">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl">📦</span>
          </div>
        )}
        {/* Stock badge */}
        <div className="absolute top-2 right-2">
          {!inStock ? (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg bg-[var(--color-error)] text-white">
              Out
            </span>
          ) : lowStock ? (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg bg-[var(--color-warning)] text-white">
              Low
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg bg-[var(--color-success)] text-white">
              {item.stock}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-[var(--color-text)] truncate leading-tight">
          {item.name}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
          {item.sku || "No SKU"}
        </p>
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-sm font-extrabold text-[var(--color-primary)] tracking-tight">
            {formatRp(item.price)}
          </span>
          <button
            onClick={() => onAdd(item)}
            disabled={!inStock}
            className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-transform leading-none"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

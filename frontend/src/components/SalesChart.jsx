import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function SalesChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-xs text-[var(--color-text-muted)] text-center py-8">
        Belum ada data penjualan
      </p>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    day: new Date(d.date).toLocaleDateString("id-ID", { weekday: "short" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={formatted} barCategoryGap="30%">
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
        />
        <YAxis hide />
        <Tooltip
          cursor={false}
          contentStyle={{
            background: "#0f172a",
            border: "none",
            borderRadius: "12px",
            color: "#f8fafc",
            fontSize: "12px",
            fontFamily: "Manrope",
          }}
          formatter={(v) => [`Rp ${v.toLocaleString("id-ID")}`, "Pendapatan"]}
        />
        <Bar
          dataKey="revenue"
          fill="#2E44A7"
          radius={[8, 8, 4, 4]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

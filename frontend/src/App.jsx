import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Items from "./pages/Items";
import Transactions from "./pages/Transactions";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--color-surface)] relative">
        <Navbar />
        <main className="px-5 pb-24 pt-2">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/items" element={<Items />} />
            <Route path="/transactions" element={<Transactions />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            fontSize: "13px",
            fontFamily: "Manrope, sans-serif",
            borderRadius: "16px",
            padding: "12px 16px",
          },
        }}
      />
    </BrowserRouter>
  );
}

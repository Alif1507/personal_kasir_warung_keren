import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Items from "./pages/Items";
import Transactions from "./pages/Transactions";
import Login from "./pages/Login";
import GuestRoute from "./routes/GuestRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./auth/AuthContext";

function AppShell() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] relative overflow-x-clip">
      <Navbar />

      <main className="px-4 pb-28 pt-3 sm:px-5 lg:pl-[21rem] lg:pr-8 lg:pt-28 lg:pb-10">
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<POS />} />
            <Route path="items" element={<Items />} />
            <Route path="transactions" element={<Transactions />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

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
    </AuthProvider>
  );
}

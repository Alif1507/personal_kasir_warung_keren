import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/";

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitting(true);

    const result = login(username.trim(), password);
    if (!result.ok) {
      toast.error(result.message);
      setSubmitting(false);
      return;
    }

    toast.success("Login berhasil");
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-8">
        <div className="mb-6">
          <h1
            className="text-3xl font-extrabold tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Kasir<span className="text-[var(--color-primary)]">Keren</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-[var(--color-text-muted)]">
            Login admin untuk melanjutkan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Username
            </span>
            <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-surface)] px-3">
              <User size={16} className="text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full bg-transparent py-3 text-sm font-medium text-[var(--color-text)] outline-none"
                required
                autoComplete="username"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Password
            </span>
            <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-surface)] px-3">
              <Lock size={16} className="text-[var(--color-text-muted)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-transparent py-3 text-sm font-medium text-[var(--color-text)] outline-none"
                required
                autoComplete="current-password"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-2xl bg-[var(--color-primary)] py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Memproses..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

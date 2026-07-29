"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "No se pudo iniciar sesión");
        return;
      }
      router.replace(params.get("next") || "/admin");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-bg px-4 text-ink">
      {/* Resplandor de fondo, como el sitio */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-[120px]" />
        <div className="hero-grid absolute inset-0 opacity-20" />
      </div>

      <form
        onSubmit={submit}
        className="relative w-full max-w-[380px] rounded-[26px] border border-line2 bg-gradient-to-b from-panel to-bg2 p-8 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)]"
      >
        <div className="mb-7 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/iglesiadigital-logo.png"
            alt="Iglesia Digital"
            className="mx-auto mb-5 h-9 w-auto"
          />
          <h1 className="font-display text-lg font-bold text-ink">Área de administración</h1>
          <p className="mt-1 text-sm text-muted">Acceso solo para el equipo</p>
        </div>

        <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Usuario</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className="mb-4 w-full rounded-[11px] border border-line bg-panel2 px-3.5 py-3 text-[15.5px] text-ink outline-none placeholder:text-[#5a638f] focus:border-accent"
        />

        <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mb-5 w-full rounded-[11px] border border-line bg-panel2 px-3.5 py-3 text-[15.5px] text-ink outline-none placeholder:text-[#5a638f] focus:border-accent"
        />

        {error && (
          <p className="mb-4 rounded-[11px] border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-accent flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
          Entrar
        </button>
      </form>
    </div>
  );
}

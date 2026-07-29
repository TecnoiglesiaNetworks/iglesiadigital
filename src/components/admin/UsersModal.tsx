"use client";
import { useEffect, useState } from "react";
import { X, UserPlus, KeyRound, Trash2, Users, Loader2, Check } from "lucide-react";

type User = { id: number; username: string; created_at: string };

export function UsersModal({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // alta
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [creating, setCreating] = useState(false);

  // cambio de contraseña por usuario
  const [editing, setEditing] = useState<number | null>(null);
  const [editPass, setEditPass] = useState("");
  const [savedId, setSavedId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const json = await res.json();
    if (json.ok) setUsers(json.users);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUser, password: newPass }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error);
        return;
      }
      setNewUser("");
      setNewPass("");
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function savePassword(id: number) {
    setError("");
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: editPass }),
    });
    const json = await res.json();
    if (!json.ok) {
      setError(json.error);
      return;
    }
    setEditing(null);
    setEditPass("");
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  }

  async function removeUser(id: number, username: string) {
    if (!confirm(`¿Eliminar al usuario "${username}"?`)) return;
    setError("");
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.ok) {
      setError(json.error);
      return;
    }
    await load();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Users size={18} /> Usuarios del panel
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          {/* Lista de usuarios */}
          <div className="space-y-2">
            {loading ? (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={15} className="animate-spin" /> Cargando…
              </p>
            ) : (
              users.map((u) => (
                <div key={u.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">{u.username}</span>
                    <div className="flex items-center gap-1">
                      {savedId === u.id && (
                        <span className="mr-1 inline-flex items-center gap-1 text-xs text-green-600">
                          <Check size={13} /> Guardado
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setEditing(editing === u.id ? null : u.id);
                          setEditPass("");
                        }}
                        title="Cambiar contraseña"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        onClick={() => removeUser(u.id, u.username)}
                        title="Eliminar usuario"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  {editing === u.id && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="password"
                        value={editPass}
                        onChange={(e) => setEditPass(e.target.value)}
                        placeholder="Nueva contraseña"
                        autoComplete="new-password"
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-violet-500"
                      />
                      <button
                        onClick={() => savePassword(u.id)}
                        disabled={editPass.length < 6}
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                      >
                        Guardar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Alta de usuario */}
          <form onSubmit={addUser} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <UserPlus size={16} /> Agregar usuario
            </h3>
            <div className="mb-2">
              <input
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                placeholder="Usuario"
                autoComplete="off"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Contraseña (mín. 6 caracteres)"
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
              />
            </div>
            <button
              type="submit"
              disabled={creating || !newUser.trim() || newPass.length < 6}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {creating ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
              Crear usuario
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

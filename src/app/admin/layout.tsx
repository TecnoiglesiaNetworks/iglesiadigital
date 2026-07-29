import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Área de administración · Iglesia Digital",
  robots: { index: false, follow: false },
};

// El panel usa tema claro propio, independiente del sitio de marketing.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-100 text-slate-800">{children}</div>;
}

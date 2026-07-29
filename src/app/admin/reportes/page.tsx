import { listLeads } from "@/lib/db";
import { Reports } from "@/components/admin/Reports";
import type { Lead } from "@/components/admin/stages";

export const dynamic = "force-dynamic";

export default function ReportesPage() {
  const leads = listLeads() as Lead[];
  return <Reports leads={leads} />;
}

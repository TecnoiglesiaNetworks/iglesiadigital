import { listLeads } from "@/lib/db";
import { Pipeline } from "@/components/admin/Pipeline";
import type { Lead } from "@/components/admin/stages";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const leads = listLeads() as Lead[];
  return <Pipeline initialLeads={leads} />;
}

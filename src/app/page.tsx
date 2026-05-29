import { getDashboardData } from "@/lib/data";
import DashboardClient from "@/components/DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  return <DashboardClient initialData={data} />;
}

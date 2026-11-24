import { HoursManager } from "@/components/admin/HoursManager";
import { getBusiness } from "@/lib/settings";

export default async function AdminHours() {
  return <HoursManager initial={await getBusiness()} />;
}

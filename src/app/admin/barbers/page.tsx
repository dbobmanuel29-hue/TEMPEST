import { BarbersManager } from "@/components/admin/BarbersManager";
import { getBarbers } from "@/lib/data";

export default async function AdminBarbers() {
  return <BarbersManager barbers={await getBarbers({ includeInactive: true })} />;
}

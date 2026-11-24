import { ServicesManager } from "@/components/admin/ServicesManager";
import { getServices } from "@/lib/data";

export default async function AdminServices() {
  const services = await getServices({ includeInactive: true });
  return <ServicesManager services={services} />;
}

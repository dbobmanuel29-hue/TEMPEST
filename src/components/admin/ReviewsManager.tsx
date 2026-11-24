"use client";

import { useRouter } from "next/navigation";
import { Stars } from "@/components/Stars";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";

type R = { id: string; name: string; rating: number; body: string; status: string; createdAt: string };

export function ReviewsManager({ reviews }: { reviews: R[] }) {
  const router = useRouter();
  const toast = useToast();
  async function set(id: string, status: string) {
    try {
      await api(`/api/admin/reviews/${id}`, "PATCH", { status });
      toast(`Review ${status}.`);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }
  async function del(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    await api(`/api/admin/reviews/${id}`, "DELETE").catch((e) => toast(e.message, "error"));
    router.refresh();
  }
  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="border border-espresso/20 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-3"><strong>{r.name}</strong><Stars rating={r.rating} className="h-3.5 w-3.5" /></span>
            <span className={`eyebrow ${r.status === "approved" ? "text-cobalt" : r.status === "rejected" ? "text-espresso/50" : ""}`}>{r.status}</span>
          </div>
          <p className="mt-2 text-sm">{r.body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {r.status !== "approved" && <button onClick={() => set(r.id, "approved")} className="btn btn-primary btn-sm">Approve</button>}
            {r.status !== "rejected" && <button onClick={() => set(r.id, "rejected")} className="btn btn-outline btn-sm">Reject</button>}
            <button onClick={() => del(r.id)} className="btn btn-outline btn-sm">Delete</button>
          </div>
        </li>
      ))}
      {!reviews.length && <li className="border border-dashed border-espresso/40 p-8 text-center text-sm">No reviews submitted yet. Customers can submit reviews from the Reviews page once signed in.</li>}
    </ul>
  );
}

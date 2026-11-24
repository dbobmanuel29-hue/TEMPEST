import Link from "next/link";
import { Stars } from "@/components/Stars";

type R = { id: string; name: string; avatarUrl: string | null; rating: number; body: string };

export function ReviewCard({ r }: { r: R }) {
  return (
    <figure className="flex h-full flex-col border border-espresso/15 bg-cream p-6">
      <Stars rating={r.rating} />
      <blockquote className="mt-4 flex-1 text-[0.95rem] leading-relaxed">“{r.body}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        {r.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.avatarUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-espresso text-sm font-bold text-cream">{r.name.charAt(0).toUpperCase()}</span>
        )}
        <span className="text-sm font-semibold">{r.name}</span>
      </figcaption>
    </figure>
  );
}

export function NoReviews() {
  return (
    <div className="border border-dashed border-espresso/40 p-10 text-center">
      <p className="display text-2xl">No reviews yet</p>
      <p className="mx-auto mt-3 max-w-md text-sm text-espresso/75">
        We only show feedback from real customers. Visit us, then tell everyone how it went.
      </p>
      <Link href="/reviews#write" className="btn btn-dark mt-6">Write a review</Link>
    </div>
  );
}

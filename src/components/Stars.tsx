import { Star } from "lucide-react";

export function Stars({ rating, className = "h-4 w-4" }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${className} ${i <= rating ? "fill-cobalt text-cobalt" : "text-espresso/25"}`} />
      ))}
    </span>
  );
}

"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";

export function ReviewForm() {
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/reviews", "POST", { rating, body });
      setSent(true);
      toast("Thank you! Your review will appear once approved.");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (sent) return <p className="border-l-4 border-cobalt bg-white p-5 text-sm">Thanks for your feedback. Our team reviews every submission before it is published.</p>;

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset>
        <legend className="label">Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button type="button" key={i} onClick={() => setRating(i)} aria-label={`${i} star${i > 1 ? "s" : ""}`} aria-pressed={rating === i}>
              <Star className={`h-8 w-8 transition ${i <= rating ? "fill-cobalt text-cobalt" : "text-espresso/30"}`} />
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="rv-body" className="label">Your experience</label>
        <textarea id="rv-body" required minLength={10} maxLength={800} rows={4} value={body} onChange={(e) => setBody(e.target.value)} className="field" placeholder="Tell us about your visit…" />
      </div>
      <button disabled={busy} className="btn btn-primary">{busy ? "Sending…" : "Submit review"}</button>
    </form>
  );
}

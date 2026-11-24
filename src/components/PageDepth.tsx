"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Scissors, ShieldCheck, Sparkles } from "lucide-react";
import { IMG } from "@/lib/media";

type Copy = { eyebrow: string; title: string; body: string; image: string; alt: string; points: string[]; cta: string; href: string };

const content: Record<string, Copy> = {
  home: { eyebrow:"The Tempest experience", title:"A better cut starts with a better experience.", body:"Take your time choosing the service, explore styles that inspire you and arrive knowing what to expect. Tempest brings the details together around one simple goal: helping you leave feeling confident.", image:IMG.interiorChairs, alt:"A clean, modern barber lounge interior", points:["A considered service menu","A style-led gallery for inspiration","A straightforward appointment journey"], cta:"Explore the lounge", href:"/about" },
  about: { eyebrow:"Our approach", title:"Good grooming is personal.", body:"The right haircut is never just about following a trend. It is about understanding your preferences, working with your hair and taking care with the finish.", image:IMG.cape, alt:"Barber cape and grooming setup", points:["Listen before the first cut","Respect every texture and style","Finish with care and precision"], cta:"Find your service", href:"/services" },
  gallery: { eyebrow:"Find your next look", title:"Bring an idea. Leave with your own style.", body:"Use the gallery as a starting point. Save a reference, think about the finish you want and talk it through before your appointment.", image:IMG.cutting, alt:"A barber carefully working on a haircut", points:["Explore different fade heights","Compare texture and shape","Discuss what suits your routine"], cta:"Book a consultation", href:"/book" },
  services: { eyebrow:"Made around you", title:"The right service for your style.", body:"Not sure where to start? Choose the result you want and let the consultation shape the details. Starting prices and estimated durations help you plan ahead.", image:IMG.detail, alt:"Close-up of professional barber tools", points:["Clear service descriptions","Starting prices shown upfront","Time estimates to plan your visit"], cta:"Choose a service", href:"/book" },
  barbers: { eyebrow:"The craft", title:"Every detail matters.", body:"A great barber listens, advises and pays attention to the finish. Explore the team profiles and choose a preferred barber when making a booking.", image:IMG.clipper, alt:"Professional barber using clippers", points:["Talk through your preferred look","Share reference photos","Choose a barber when booking"], cta:"Book your barber", href:"/book" },
  reviews: { eyebrow:"Your voice matters", title:"Help others choose with confidence.", body:"Useful feedback is specific and honest. Share what went well, what style you chose and how the overall experience felt.", image:IMG.interior, alt:"Warm modern barber lounge interior", points:["Keep feedback genuine","Be respectful and constructive","Share details that help future clients"], cta:"Explore our services", href:"/services" },
  contact: { eyebrow:"Before you visit", title:"We are happy to help you plan.", body:"If you have a question about a service, timing or the booking process, reach out before your visit. A little preparation makes the appointment smoother.", image:IMG.interiorWide, alt:"Wide view of a modern barber lounge", points:["Ask about the right service","Confirm details before travelling","Arrive a few minutes before your slot"], cta:"See appointment options", href:"/book" },
  book: { eyebrow:"Your appointment", title:"A little preparation goes a long way.", body:"Choose the service that best matches the result you want. If you are unsure, use the appointment notes to explain your preferred style or mention any questions for your barber.", image:IMG.cutting, alt:"Barber working carefully on a client's hair", points:["Choose a service and barber","Select a suitable date and time","Add clear notes for your visit"], cta:"Browse services", href:"/services" },
  account: { eyebrow:"Your visits, organised", title:"Keep your grooming plans in one place.", body:"When account features are connected, your profile is the place to review appointment details, keep contact information current and revisit previous visits.", image:IMG.interiorChairs, alt:"Barber chairs inside a modern lounge", points:["Keep your contact details current","Review appointment information","Plan your next visit"], cta:"Make a new booking", href:"/book" },
  auth: { eyebrow:"Welcome to Tempest", title:"Your next great haircut is a few steps away.", body:"Create an account when account services are enabled, or continue to explore the services and styles before deciding what to book.", image:IMG.hero, alt:"Portrait showing a sharp modern haircut", points:["Explore the service menu","Find inspiration in the gallery","Get ready for your visit"], cta:"Explore services", href:"/services" },
  policy: { eyebrow:"Clear expectations", title:"Good service starts with clarity.", body:"We want visitors to understand the important details before making a decision. Review the information here and contact the lounge if something needs clarification.", image:IMG.detail, alt:"Barber tools arranged for a grooming service", points:["Understand the booking process","Know how changes are handled","Contact us with questions"], cta:"Contact the lounge", href:"/contact" },
  generic: { eyebrow:"The Tempest standard", title:"Look sharp. Feel powerful.", body:"Explore the lounge, find a service that fits your style and make time for a little self-care. Your next visit can start right here.", image:IMG.interior, alt:"Modern barber lounge interior", points:["Thoughtful grooming","A style-led experience","A simple way to plan your visit"], cta:"Book an appointment", href:"/book" },
};

function getCopy(path: string): Copy {
  if (path === "/") return content.home;
  if (path.startsWith("/about")) return content.about;
  if (path.startsWith("/gallery")) return content.gallery;
  if (path.startsWith("/services")) return content.services;
  if (path.startsWith("/barbers")) return content.barbers;
  if (path.startsWith("/reviews")) return content.reviews;
  if (path.startsWith("/contact")) return content.contact;
  if (path.startsWith("/book") || path.startsWith("/booking")) return content.book;
  if (path.startsWith("/account")) return content.account;
  if (path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/forgot-password")) return content.auth;
  if (path.startsWith("/privacy") || path.startsWith("/terms") || path.startsWith("/cancellation-policy")) return content.policy;
  return content.generic;
}

export function PageDepth() {
  const pathname = usePathname() || "/";
  const copy = getCopy(pathname);
  return (
    <>
      <section className="overflow-hidden bg-cream py-16 md:py-24">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div data-reveal>
            <p className="eyebrow text-cobalt">{copy.eyebrow}</p>
            <h2 className="display mt-4 text-4xl md:text-6xl">{copy.title}</h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-espresso/75">{copy.body}</p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {copy.points.map((point) => <li key={point} className="flex items-start gap-3 text-sm text-espresso/80"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" />{point}</li>)}
            </ul>
            <Link href={copy.href} className="btn btn-outline mt-9">{copy.cta}<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="img-zoom relative aspect-[5/4] overflow-hidden rounded-md bg-mist" data-reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={copy.image} alt={copy.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
      <section className="bg-espresso py-14 text-cream md:py-20">
        <div className="container-x grid gap-8 md:grid-cols-[1.2fr_2fr] md:items-center">
          <div data-reveal>
            <p className="eyebrow text-sand">Look sharp. Feel powerful.</p>
            <h2 className="display mt-3 text-3xl md:text-5xl">Make time for your next reset.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3" data-reveal>
            <div className="border-t border-cream/25 pt-4"><Scissors className="h-5 w-5 text-sand" /><h3 className="mt-3 font-semibold">Your style</h3><p className="mt-2 text-sm leading-relaxed text-cream/65">Choose a look that feels right for you.</p></div>
            <div className="border-t border-cream/25 pt-4"><Clock3 className="h-5 w-5 text-sand" /><h3 className="mt-3 font-semibold">Your time</h3><p className="mt-2 text-sm leading-relaxed text-cream/65">Plan your visit around your schedule.</p></div>
            <div className="border-t border-cream/25 pt-4"><ShieldCheck className="h-5 w-5 text-sand" /><h3 className="mt-3 font-semibold">Your comfort</h3><p className="mt-2 text-sm leading-relaxed text-cream/65">Know what to expect before you arrive.</p></div>
          </div>
          <div className="md:col-span-2" data-reveal>
            <Link href="/book" className="btn btn-primary">Book Appointment<CalendarDays className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}

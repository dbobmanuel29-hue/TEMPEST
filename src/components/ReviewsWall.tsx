"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { px } from "@/lib/media";

const KEY = "tempest_showcase_reviews";
const SESSION = "tempest_showcase_session";
const USERS = "tempest_showcase_users";
type Review = { id:string; name:string; service:string; rating:number; body:string; image:string; date:string; sample?:boolean };
const samples:Review[] = [
 {id:"sample-1",name:"Style inspiration",service:"Nigerian low fade",rating:5,body:"A clean low fade with a sharp line-up. This is the kind of neat, detailed finish customers come to Tempest for.",image:px(12074386,420,320),date:"Style preview",sample:true},
 {id:"sample-2",name:"Style inspiration",service:"American taper fade",rating:5,body:"A smooth taper with natural texture on top. A versatile cut that works just as well for everyday wear.",image:px(12304510,420,320),date:"Style preview",sample:true},
 {id:"sample-3",name:"Style inspiration",service:"Waves & beard",rating:5,body:"Defined waves paired with a carefully shaped beard for a crisp, finished look.",image:px(39945585,420,320),date:"Style preview",sample:true},
 {id:"sample-4",name:"Style inspiration",service:"Afro shape-up",rating:5,body:"A well-shaped afro with clean edges. Great grooming is all about proportion and detail.",image:px(19112533,420,320),date:"Style preview",sample:true},
];
type LocalUser={id:string;name:string;email:string};
export function ReviewsWall({compact=false}:{compact?:boolean}) {
 const [reviews,setReviews]=useState<Review[]>([]);
 const [user,setUser]=useState<LocalUser|null>(null);
 const [rating,setRating]=useState(5);
 const [service,setService]=useState("Haircut");
 const [body,setBody]=useState("");
 const [sent,setSent]=useState(false);
 useEffect(()=>{
  const sync=()=>{try{const id=localStorage.getItem(SESSION);const list=JSON.parse(localStorage.getItem(USERS)||"[]") as LocalUser[];setUser(list.find(x=>x.id===id)||null);const saved=JSON.parse(localStorage.getItem(KEY)||"[]") as Review[];setReviews([...saved,...samples]);}catch{setUser(null);setReviews(samples);}};
  sync();window.addEventListener("storage",sync);window.addEventListener("tempest-auth-change",sync);return()=>{window.removeEventListener("storage",sync);window.removeEventListener("tempest-auth-change",sync);};
 },[]);
 function submit(e:React.FormEvent){e.preventDefault();if(!user||body.trim().length<8)return;const saved=JSON.parse(localStorage.getItem(KEY)||"[]") as Review[];const review:Review={id:crypto.randomUUID(),name:user.name,service,rating,body:body.trim(),image:px([12074386,12304510,39945585,19112533][saved.length%4],420,320),date:new Date().toLocaleDateString("en-NG")};localStorage.setItem(KEY,JSON.stringify([review,...saved]));setReviews([review,...reviews]);setBody("");setSent(true);}
 const visible=compact?reviews.slice(0,3):reviews;
 return <div>
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
   {visible.map(r=><article key={r.id} className="overflow-hidden rounded-md border border-espresso/15 bg-cream">
    <div className="relative aspect-[16/9] overflow-hidden bg-mist"><img src={r.image} alt={r.service+" haircut style"} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"/><span className="absolute bottom-3 left-3 rounded-sm bg-cream px-3 py-1 text-[0.62rem] font-bold uppercase tracking-wider">{r.service}</span></div>
    <div className="p-5"><div className="flex items-center gap-1 text-cobalt" aria-label={r.rating+" out of 5 stars"}>{Array.from({length:r.rating}).map((_,i)=><Star key={i} className="h-3.5 w-3.5 fill-current"/>)}</div><p className="mt-3 text-sm leading-relaxed text-espresso/80">“{r.body}”</p><div className="mt-5 flex items-center justify-between gap-2 border-t border-espresso/10 pt-3"><span className="text-sm font-semibold">{r.name}</span><span className="text-[0.62rem] uppercase tracking-wider text-espresso/50">{r.sample?"Style preview":r.date}</span></div></div>
   </article>)}
  </div>
  <div id="write-review" className="mt-12 rounded-md bg-espresso p-6 text-cream md:p-8">
   {user?<form onSubmit={submit} className="grid gap-5 md:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow text-sand">Signed in as {user.name}</p><h3 className="display mt-3 text-3xl md:text-4xl">Share your experience.</h3><p className="mt-3 text-sm text-cream/65">Your review will be saved in this browser preview.</p></div><div className="space-y-4"><div><label className="label text-cream" htmlFor="review-service">Service</label><select id="review-service" className="field" value={service} onChange={e=>setService(e.target.value)}><option>Haircut</option><option>Low fade</option><option>Skin fade</option><option>Taper fade</option><option>Afro / waves</option><option>Beard grooming</option><option>Hot towel shave</option></select></div><div><span className="label text-cream">Your rating</span><div className="flex gap-2">{[1,2,3,4,5].map(n=><button type="button" key={n} aria-label={n+" stars"} onClick={()=>setRating(n)} className={n<=rating?"text-sand":"text-cream/35"}><Star className="h-6 w-6 fill-current"/></button>)}</div></div><div><label htmlFor="review-body" className="label text-cream">Your review</label><textarea id="review-body" required minLength={8} maxLength={500} value={body} onChange={e=>setBody(e.target.value)} className="field min-h-28" placeholder="Tell us about your cut and experience…"/></div><button className="btn btn-primary">Post review</button>{sent&&<p role="status" className="text-sm text-sand">Your review has been added to this browser preview.</p>}</div></form>:<div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center"><div><p className="eyebrow text-sand">Been to Tempest?</p><h3 className="display mt-2 text-3xl">Your review belongs here.</h3><p className="mt-2 max-w-xl text-sm text-cream/65">Sign in or create an account to leave a rating and share your experience.</p></div><div className="flex flex-wrap gap-3"><Link href="/login?next=%2Freviews%23write-review" className="btn btn-primary">Sign in</Link><Link href="/register?next=%2Freviews%23write-review" className="btn btn-outline-light">Create account</Link></div></div>}
  </div>
  <p className="mt-4 text-xs leading-relaxed text-espresso/55">The haircut photos are style illustrations, not verified customer photos. Sample style cards are labelled; customer reviews submitted in this preview are stored locally on this device.</p>
 </div>;
}

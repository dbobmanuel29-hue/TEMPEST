"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
type User={id:string;name:string;email:string;phone:string;password:string};
type Booking={id:string;reference:string;serviceName:string;barberName:string;date:string;startMin:number;priceNgn:number;status:string;customerName:string;customerPhone:string;customerEmail:string;durationMin:number};
export default function AccountPage(){
 const router=useRouter();const [user,setUser]=useState<User|null>(null);const [bookings,setBookings]=useState<Booking[]>([]);
 useEffect(()=>{const id=localStorage.getItem("tempest_showcase_session");const users:User[]=JSON.parse(localStorage.getItem("tempest_showcase_users")||"[]");const current=users.find(u=>u.id===id)||null;if(!current){router.replace("/login?next=/account");return;}setUser(current);const all:Booking[]=JSON.parse(localStorage.getItem("tempest_showcase_bookings")||"[]");setBookings(all.filter(b=>b.customerEmail.toLowerCase()===current.email.toLowerCase()).sort((a,b)=>b.date.localeCompare(a.date)||b.startMin-a.startMin));},[router]);
 function signOut(){localStorage.removeItem("tempest_showcase_session");router.push("/");router.refresh();}
 if(!user)return <div className="container-x py-24 text-center">Loading your account…</div>;
 const upcoming=bookings.filter(b=>b.date>=new Date().toLocaleDateString("en-CA",{timeZone:"Africa/Lagos"}));
 const history=bookings.filter(b=>!upcoming.includes(b));
 const time=(n:number)=>{const h=Math.floor(n/60),m=n%60;return new Date(2000,0,1,h,m).toLocaleTimeString("en-NG",{hour:"numeric",minute:"2-digit"});};
 return <><PageHeader eyebrow="My account" title={<>Hi, {user.name.split(" ")[0]}</>} intro="Your profile and appointments saved in this browser."/>
 <section className="bg-cream py-14"><div className="container-x max-w-4xl space-y-14">
 <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow text-cobalt">Local showcase profile</p><h2 className="display mt-2 break-words text-2xl sm:text-3xl">{user.name}</h2><p className="mt-2 break-words text-sm text-espresso/70">{user.email} {user.phone&&"· "+user.phone}</p></div><button onClick={signOut} className="btn btn-outline">Sign out</button></div>
 <div><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="display min-w-0 text-2xl sm:text-3xl">Upcoming appointments</h2><Link href="/book" className="btn btn-primary btn-sm shrink-0">New booking</Link></div><div className="grid gap-3">{upcoming.map(b=><article key={b.id} className="border border-espresso/20 bg-white p-5"><div className="flex min-w-0 flex-wrap items-start justify-between gap-3"><div><p className="eyebrow text-cobalt">{b.reference}</p><h3 className="display mt-1 text-xl">{b.serviceName}</h3><p className="mt-1 text-sm text-espresso/70">With {b.barberName}</p></div><span className="text-xs font-bold uppercase text-cobalt">{b.status}</span></div><p className="mt-4 text-sm">{b.date} · {time(b.startMin)} · ₦{b.priceNgn.toLocaleString("en-NG")}</p></article>)}{!upcoming.length&&<p className="border border-dashed border-espresso/40 p-6 text-sm">No upcoming appointments. <Link href="/book" className="underline">Book one now</Link>.</p>}</div></div>
 <div><h2 className="display mb-5 text-3xl">Booking history</h2><div className="space-y-3">{history.map(b=><article key={b.id} className="border border-espresso/15 p-5"><div className="flex flex-wrap justify-between gap-2"><strong>{b.serviceName}</strong><span className="text-xs uppercase text-espresso/60">{b.status}</span></div><p className="mt-2 text-sm text-espresso/70">{b.date} · {time(b.startMin)} · {b.reference}</p></article>)}{!history.length&&<p className="text-sm text-espresso/70">Past appointments will appear here.</p>}</div></div>
 <p className="border-l-4 border-cobalt bg-white p-4 text-xs leading-relaxed text-espresso/70">This is a frontend showcase account. Your profile and bookings are stored in this browser only. They are not synced to the shop, another device, or a shared database.</p>
 </div></section></>;
}
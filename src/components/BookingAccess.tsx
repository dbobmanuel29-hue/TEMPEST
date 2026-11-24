"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { BookingWizard } from "@/components/BookingWizard";
type Props={user:{name:string;email:string;phone:string|null}|null;initialService?:string;initialBarber?:string};
export function BookingAccess({user,initialService,initialBarber}:Props){
 const [ready,setReady]=useState(false);const [signed,setSigned]=useState(false);
 useEffect(()=>{const check=()=>{try{const id=localStorage.getItem("tempest_showcase_session");const users=JSON.parse(localStorage.getItem("tempest_showcase_users")||"[]") as {id:string}[];setSigned(Boolean(id&&users.some(u=>u.id===id)));}catch{setSigned(false);}setReady(true);};check();window.addEventListener("storage",check);window.addEventListener("tempest-auth-change",check);return()=>{window.removeEventListener("storage",check);window.removeEventListener("tempest-auth-change",check);};},[]);
 if(!ready)return <div className="container-x py-24 text-center">Checking your account…</div>;
 if(!signed)return <section className="container-x max-w-2xl py-20 text-center"><p className="eyebrow text-cobalt">Account required</p><h1 className="display mt-4 text-4xl md:text-6xl">Sign in to book.</h1><p className="mx-auto mt-5 max-w-lg leading-relaxed text-espresso/75">You can browse our services and gallery without an account. To reserve an appointment, please sign in or create your customer account first.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/login?next=%2Fbook" className="btn btn-primary">Sign in</Link><Link href="/register?next=%2Fbook" className="btn btn-outline">Create account</Link></div><Link href="/gallery" className="mt-6 inline-block text-sm underline">Explore the gallery</Link></section>;
 return <BookingWizard user={user} initialService={initialService} initialBarber={initialBarber}/>;
}

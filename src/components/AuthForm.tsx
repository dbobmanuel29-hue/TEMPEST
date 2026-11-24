"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
const USERS_KEY="tempest_showcase_users", SESSION_KEY="tempest_showcase_session";
type User={id:string;name:string;email:string;phone:string;password:string};
type Mode="login"|"register"|"forgot"|"reset";
const safeNext=(n?:string)=>n&&n.startsWith("/")&&!n.startsWith("//")?n:"";
export function AuthForm({mode,next}:{mode:Mode;google?:boolean;next?:string;token?:string}){
 const router=useRouter(),toast=useToast();
 const [f,setF]=useState({name:"",email:"",phone:"",password:""}),[busy,setBusy]=useState(false),[sent,setSent]=useState(false);
 const nx=safeNext(next),set=(k:keyof typeof f)=>(e:React.ChangeEvent<HTMLInputElement>)=>setF({...f,[k]:e.target.value});
 function submit(e:React.FormEvent){e.preventDefault();setBusy(true);try{
  const users:User[]=JSON.parse(localStorage.getItem(USERS_KEY)||"[]"),email=f.email.trim().toLowerCase();
  if(mode==="register"){if(f.password.length<8)throw new Error("Use a password with at least 8 characters.");if(users.some(u=>u.email===email))throw new Error("An account with this email already exists.");
   const user={id:crypto.randomUUID(),name:f.name.trim(),email,phone:f.phone.trim(),password:f.password};localStorage.setItem(USERS_KEY,JSON.stringify([...users,user]));localStorage.setItem(SESSION_KEY,user.id);window.dispatchEvent(new Event("tempest-auth-change"));toast("Account created on this device.");router.push(nx||"/account");router.refresh();
  }else if(mode==="login"){const user=users.find(u=>u.email===email&&u.password===f.password);if(!user)throw new Error("Email or password is incorrect. Create an account on this device first.");localStorage.setItem(SESSION_KEY,user.id);window.dispatchEvent(new Event("tempest-auth-change"));toast("Signed in.");router.push(nx||"/account");router.refresh();}
  else if(mode==="forgot")setSent(true);else throw new Error("Password reset is not connected in this frontend showcase.");
 }catch(err){toast((err as Error).message,"error");}finally{setBusy(false);}}
 if(sent)return <div className="border-l-4 border-cobalt bg-white p-5 text-sm">Password reset is not connected in this frontend showcase. You can create a new local account with another email address.</div>;
 const q=nx?"?next="+encodeURIComponent(nx):"";
 return <form onSubmit={submit} className="space-y-4">
 {mode==="register"&&<><div><label htmlFor="a-name" className="label">Full name</label><input id="a-name" required className="field" value={f.name} onChange={set("name")} autoComplete="name"/></div><div><label htmlFor="a-phone" className="label">Phone (optional)</label><input id="a-phone" type="tel" className="field" value={f.phone} onChange={set("phone")} autoComplete="tel"/></div></>}
 {mode!=="reset"&&<div><label htmlFor="a-email" className="label">Email</label><input id="a-email" type="email" required className="field" value={f.email} onChange={set("email")} autoComplete="email"/></div>}
 {mode!=="forgot"&&<div><label htmlFor="a-pass" className="label">Password</label><input id="a-pass" type="password" required minLength={mode==="login"?1:8} className="field" value={f.password} onChange={set("password")} autoComplete={mode==="login"?"current-password":"new-password"}/>{mode!=="login"&&<p className="mt-1 text-xs text-espresso/60">At least 8 characters.</p>}</div>}
 <button disabled={busy} className="btn btn-primary w-full !py-4">{busy?"Please wait…":mode==="login"?"Sign in":mode==="register"?"Create account":mode==="forgot"?"Continue":"Update password"}</button>
 <p className="text-xs leading-relaxed text-espresso/60">Frontend showcase account: details are stored only in this browser on this device. Do not use a real or reused password.</p>
 <div className="flex flex-wrap justify-between gap-2 pt-2 text-sm">{mode==="login"?<><Link href="/forgot-password" className="underline">Forgot password?</Link><Link href={"/register"+q} className="underline">Create an account</Link></>:mode==="register"?<Link href={"/login"+q} className="underline">Already have an account? Sign in</Link>:<Link href="/login" className="underline">Back to sign in</Link>}</div>
 </form>;
}
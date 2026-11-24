"use client";
import { ChevronLeft,ChevronRight } from "lucide-react";
import { useState } from "react";
import { addDays,nowLagos } from "@/lib/time";
const HEAD=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
export function BookingCalendar({value,onChange,serviceId,barberId,maxAdvanceDays}:{value:string|null;onChange:(date:string)=>void;serviceId:string;barberId:string;maxAdvanceDays:number}){
 const today=nowLagos().date,[month,setMonth]=useState((value??today).slice(0,7));
 const first=new Date(month+"-01T00:00:00Z"),offset=(first.getUTCDay()+6)%7,count=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
 const shift=(n:number)=>{const d=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+n,1));setMonth(d.toISOString().slice(0,7));};
 const canPrev=month>today.slice(0,7),canNext=month<addDays(today,maxAdvanceDays).slice(0,7);
 const label=first.toLocaleDateString("en-GB",{month:"long",year:"numeric",timeZone:"UTC"});
 return <div className="border border-espresso/20 bg-white p-4 sm:p-6">
 <div className="mb-4 flex items-center justify-between"><button type="button" onClick={()=>shift(-1)} disabled={!canPrev} aria-label="Previous month" className="rounded p-2 hover:bg-sand disabled:opacity-30"><ChevronLeft className="h-5 w-5"/></button><h3 className="display text-xl">{label}</h3><button type="button" onClick={()=>shift(1)} disabled={!canNext} aria-label="Next month" className="rounded p-2 hover:bg-sand disabled:opacity-30"><ChevronRight className="h-5 w-5"/></button></div>
 <div className="grid grid-cols-7 gap-1 text-center sm:gap-1.5" role="grid" aria-label="Choose a date">
 {HEAD.map(h=><div key={h} className="pb-2 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-espresso/60">{h}</div>)}
 {Array.from({length:offset}).map((_,i)=><div key={"o"+i}/>)}
 {Array.from({length:count}).map((_,i)=>{const date=month+"-"+String(i+1).padStart(2,"0"),weekday=new Date(date+"T12:00:00Z").getUTCDay(),open=date>=today&&date<=addDays(today,maxAdvanceDays)&&weekday!==0,selected=value===date;
 return <button key={date} type="button" role="gridcell" disabled={!open} aria-selected={selected} aria-label={date+(open?"":" (unavailable)")} onClick={()=>onChange(date)} className={"aspect-square text-sm font-semibold transition "+(selected?"bg-cobalt text-white":open?"border border-espresso/25 hover:border-cobalt hover:bg-cream":"text-espresso/25 line-through")+(date===today&&!selected?" ring-2 ring-inset ring-espresso":"")}>{i+1}</button>;
 })}
 </div><p className="mt-4 text-xs text-espresso/60">Select an available date. Sundays are closed. Availability is simulated for this frontend showcase.</p></div>;
}

import React from 'react'

export function Card({ children, className='' }: React.PropsWithChildren<{className?: string}>) {
  return <div className={`rounded-2xl border bg-white shadow-sm ${className}`}>{children}</div>
}
export function CardHeader({ children, className='' }: React.PropsWithChildren<{className?: string}>) {
  return <div className={`p-4 border-b ${className}`}>{children}</div>
}
export function CardBody({ children, className='' }: React.PropsWithChildren<{className?: string}>) {
  return <div className={`p-4 ${className}`}>{children}</div>
}
export function Button({ children, className='', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`px-3 py-2 rounded-xl text-sm font-medium border shadow-sm hover:shadow transition ${className}`}>{children}</button>
}
export function Badge({ children, className='' }: React.PropsWithChildren<{className?: string}>) {
  return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${className}`}>{children}</span>
}
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 ${props.className||''}`} />
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 ${props.className||''}`}></textarea>
}
export function Select({ value, onChange, children, className='' }:{value:string, onChange:(v:string)=>void, className?:string, children:React.ReactNode}){
  return (
    <select value={value} onChange={(e)=>onChange(e.target.value)} className={`w-full rounded-xl border px-3 py-2 text-sm ${className}`}>
      {children}
    </select>
  )
}

import clsx from "clsx";
import type { ReactNode } from "react";
export const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={clsx("rounded-2xl border border-border bg-surface/80 p-4", className)}>{children}</div>
);
export const Button = ({ children, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) => (
  <button {...p} className={clsx("rounded-xl bg-gradient-to-br from-brandA to-brandB px-4 py-2 font-black text-white hover:brightness-105 active:scale-[0.99]", className)}>{children}</button>
);
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className={clsx("w-full rounded-xl border border-border bg-black/20 px-3 py-2 outline-none", p.className)} />
);

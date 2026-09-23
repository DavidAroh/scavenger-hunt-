import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { EVENT } from "@/lib/config";

/** Page frame. Logo top-left with a 16-32px margin, single column, footer with site + handle. */
export function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-dvh flex flex-col px-5 sm:px-8 pt-6 pb-8">
      <header className="flex items-center justify-between">
        <Link href="/" aria-label="Home">
          <BrandLogo className="h-11 w-auto" />
        </Link>
        <span className="label text-fog-400 hidden sm:block">{EVENT.name}</span>
      </header>
      <main className={`flex-1 w-full mx-auto mt-8 ${wide ? "max-w-5xl" : "max-w-[480px]"}`}>{children}</main>
      <footer className={`mx-auto w-full ${wide ? "max-w-5xl" : "max-w-[480px]"} mt-12 pt-4 border-t-3 border-paper/20 flex items-center justify-between text-sm text-fog-400`}>
        <a href={EVENT.siteUrl} className="underline decoration-2 underline-offset-4 hover:text-paper">
          {EVENT.site}
        </a>
        <span className="font-mono text-xs">{EVENT.social}</span>
      </footer>
    </div>
  );
}

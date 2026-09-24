import { headers } from "next/headers";
import QRCode from "qrcode";
import { BrandLogo } from "@/components/BrandLogo";
import { DownloadCheckpointJpg } from "@/components/DownloadCheckpointJpg";
import { PrintButton } from "@/components/PrintButton";
import { requireAdmin } from "@/lib/admin-auth";
import { EVENT } from "@/lib/config";
import { isPersistentStorageConfigured, store } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function QrSheet() {
  await requireAdmin();
  if (!isPersistentStorageConfigured) {
    return (
      <div className="min-h-dvh bg-paper text-ink p-8">
        <h1 className="text-3xl font-bold">Do not print yet</h1>
        <p className="mt-3">Configure persistent Supabase storage before printing live checkpoint codes.</p>
      </div>
    );
  }

  let checkpoints;
  try {
    checkpoints = await store.listCheckpoints();
  } catch {
    return (
      <div className="min-h-dvh bg-paper text-ink p-8">
        <h1 className="text-3xl font-bold">Checkpoint setup needed</h1>
        <p className="mt-3">Run <code>supabase/migrations/20260924_checkpoint_progress.sql</code> in the Supabase SQL Editor, then reload this page.</p>
      </div>
    );
  }
  if (checkpoints.length !== 12) {
    return (
      <div className="min-h-dvh bg-paper text-ink p-8">
        <h1 className="text-3xl font-bold">Checkpoint setup incomplete</h1>
        <p className="mt-3">The database returned {checkpoints.length} of 12 checkpoint codes. Run the migration and reload this page.</p>
      </div>
    );
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const proto = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = (process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`).replace(/\/$/, "");
  const entries = await Promise.all(
    checkpoints.map(async (checkpoint) => {
      const url = `${base}/checkpoint/${checkpoint.token}`;
      const svg = await QRCode.toString(url, {
        type: "svg",
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#212120", light: "#FFFFFF" },
      });
      return { checkpoint, url, svg };
    }),
  );

  return (
    <main className="min-h-dvh bg-paper text-ink px-6 py-8 sm:px-8">
      <header className="flex items-start justify-between gap-4 print:mb-4">
        <BrandLogo tone="black" className="h-12 w-auto" />
        <div className="text-right print:hidden">
          <p className="max-w-lg text-sm mb-2">
            Download a labeled JPG for each checkpoint, or print the full sheet and choose Save as PDF. Codes point to <span className="font-mono">{base}</span>; confirm <span className="font-mono">NEXT_PUBLIC_BASE_URL</span> is your live domain first.
          </p>
          <PrintButton />
        </div>
      </header>

      <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight">{EVENT.name}: checkpoint QR codes</h1>
      <p className="mt-2 max-w-3xl text-sm text-fog-500 print:hidden">
        Print at 100% on white paper, or download labeled JPGs for individual checkpoints. Each image includes its QR number and route stop; place it at the matching fixed spot and test it with a phone before the hunt opens.
      </p>
      <p className="mt-2 hidden print:block text-sm text-fog-500">Print at 100%. Keep every code black on white with a clear margin.</p>

      <ol className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 print:grid-cols-2 print:gap-3">
        {entries.map(({ checkpoint, url, svg }, i) => (
          <li key={checkpoint.id} className="break-inside-avoid border-[3px] border-ink p-4 print:p-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold leading-tight">QR {String(checkpoint.qrNumber).padStart(2, "0")} · {checkpoint.label}</h2>
              <span className="shrink-0 font-mono text-xs text-fog-500">STOP {String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="mt-3 flex justify-center border-2 border-ink bg-white p-2">
              <div className="qr aspect-square w-full max-w-[220px]" dangerouslySetInnerHTML={{ __html: svg }} />
            </div>
            <p className="mt-2 break-all font-mono text-[10px] text-fog-500">{url}</p>
            <DownloadCheckpointJpg
              svg={svg}
              qrNumber={checkpoint.qrNumber}
              label={checkpoint.label}
              routeStop={i + 1}
            />
          </li>
        ))}
      </ol>

      <aside className="mt-8 border-2 border-ink p-4 text-sm print:hidden">
        <p className="font-bold">Route order</p>
        <p className="mt-1">QR 09 start → QR 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 10 → 11 → QR 12 finish.</p>
        <p className="mt-2 text-fog-500">Apply <span className="font-mono">supabase/migrations/20260924_checkpoint_progress.sql</span> before testing checkpoint scans.</p>
      </aside>
    </main>
  );
}

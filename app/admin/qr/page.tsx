import { headers } from "next/headers";
import QRCode from "qrcode";
import { BrandLogo } from "@/components/BrandLogo";
import { PrintButton } from "@/components/PrintButton";
import { requireAdmin } from "@/lib/admin-auth";
import { EVENT } from "@/lib/config";
import { isPersistentStorageConfigured } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Print-ready sheet for the ONE booth QR. White paper, brand-black ink. */
export default async function QrSheet() {
  await requireAdmin();
  if (!isPersistentStorageConfigured) return <div className="min-h-dvh bg-paper text-ink p-8"><h1 className="text-3xl font-bold">Do not print yet</h1><p className="mt-3">Configure persistent Supabase storage before printing the live hunt QR.</p></div>;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = (process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`).replace(/\/$/, "");

  const url = `${base}/`;
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#212120", light: "#FFFFFF" },
  });

  return (
    <div className="min-h-dvh bg-paper text-ink px-8 py-8">
      <div className="flex items-start justify-between print:mb-4">
        <BrandLogo tone="black" className="h-12 w-auto" />
        <div className="text-right print:hidden">
          <p className="text-sm mb-2">
            Encoding <span className="font-mono">{url}</span>. Set NEXT_PUBLIC_BASE_URL to your live domain first.
          </p>
          <PrintButton />
        </div>
      </div>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">{EVENT.name}: booth QR</h1>
      <p className="text-sm mt-1 text-fog-500">Print at 100%. Keep at least 3cm of white around the code. Do not rotate or re-colour the logo.</p>

      <div className="mt-8 max-w-md">
        <section className="break-inside-avoid">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-xl font-bold">Scan to start the hunt</h2>
            <span className="label text-fog-500">BOOTH</span>
          </div>
          <div className="border-[3px] border-ink p-3 bg-white">
            <div className="qr w-full aspect-square" dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
          <p className="mt-2 text-xs font-mono break-all text-fog-500">{url}</p>
          <p className="text-xs mt-1">Place: front and centre on the RIL booth. This is the only code players scan.</p>
        </section>
      </div>
    </div>
  );
}

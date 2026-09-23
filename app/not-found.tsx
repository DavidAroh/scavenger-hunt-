import Link from "next/link";
import { Shell } from "@/components/Shell";

export default function NotFound() {
  return (
    <Shell>
      <p className="label text-coral">404</p>
      <h1 className="display mt-3">Dead link.</h1>
      <p className="mt-4 text-fog-200 font-light">This page took a wrong turn. The hunt didn't.</p>
      <Link href="/" className="btn btn-paper mt-8">
        Back to start <span aria-hidden>›</span>
      </Link>
    </Shell>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Html5Qrcode } from "html5-qrcode";

function localCheckpointPath(decodedText: string): string | null {
  try {
    const url = new URL(decodedText, window.location.origin);
    const match = url.pathname.match(/^\/checkpoint\/([^/]+)\/?$/);
    if (!match || !/^[A-Za-z0-9_-]{1,128}$/.test(match[1])) return null;
    return `/checkpoint/${encodeURIComponent(match[1])}`;
  } catch {
    return null;
  }
}

export function QrScanner() {
  const router = useRouter();
  const id = useId().replaceAll(":", "");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);
  const [starting, setStarting] = useState(false);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => () => {
    const scanner = scannerRef.current;
    if (scanner) void scanner.stop().catch(() => undefined);
  }, []);

  async function startScanner() {
    setStarting(true);
    setStatus("Starting camera…");
    setError("");
    handledRef.current = false;
    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(id, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (handledRef.current) return;
          const path = localCheckpointPath(decodedText);
          if (!path) {
            setError("That isn't a RIL checkpoint QR. Keep the camera on the clue's QR code.");
            return;
          }

          handledRef.current = true;
          setStatus("Checkpoint found. Opening it in the hunt…");
          setError("");
          try {
            await scanner.stop();
            scanner.clear();
          } catch {
            // Navigation still opens the same-site checkpoint page if the camera is already stopped.
          }
          scannerRef.current = null;
          setActive(false);
          router.push(path);
        },
        () => undefined,
      );
      setActive(true);
      setStatus("Camera is on. Point it at the checkpoint QR.");
    } catch {
      const scanner = scannerRef.current;
      if (scanner) {
        try {
          await scanner.stop();
          scanner.clear();
        } catch {
          // A denied permission can leave the scanner unstarted, where stop is not available.
        }
      }
      scannerRef.current = null;
      setActive(false);
      setStatus("");
      setError("Camera unavailable. Allow camera access and use the hunt over HTTPS, then try again.");
    } finally {
      setStarting(false);
    }
  }

  async function stopScanner() {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
        scanner.clear();
      } catch {
        // It may already have stopped after a scan or browser permission change.
      }
    }
    setActive(false);
    setStatus("Camera stopped.");
  }

  return (
    <section className="mt-6 border-2 border-paper/35 p-4" aria-labelledby={`${id}-title`}>
      <p className="label text-sky">Stay in the hunt</p>
      <h2 id={`${id}-title`} className="mt-2 text-lg font-bold">Scan a checkpoint here</h2>
      <p className="mt-2 text-sm text-fog-200">
        Open the camera and point it at the QR from your clue. The checkpoint opens on this page; camera access starts only when you tap below.
      </p>
      {!active ? (
        <button type="button" onClick={startScanner} disabled={starting} className="btn btn-blue mt-4 w-full" aria-controls={id} aria-expanded={starting}>
          {starting ? "Starting camera…" : "Open QR scanner"}
        </button>
      ) : (
        <button type="button" onClick={stopScanner} className="btn btn-ghost mt-4 w-full" aria-controls={id} aria-expanded="true">
          Stop camera
        </button>
      )}
      <div
        id={id}
        className={`in-app-qr-scanner mt-4 overflow-hidden ${active || starting ? "block" : "hidden"}`}
        aria-hidden="true"
      />
      <p className="mt-3 text-sm text-fog-300" role="status" aria-live="polite">{status}</p>
      {error && <p className="mt-2 text-sm text-coral" role="alert">{error}</p>}
    </section>
  );
}

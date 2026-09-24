"use client";

import { useState } from "react";

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function DownloadCheckpointJpg({
  svg,
  qrNumber,
  label,
  routeStop,
}: {
  svg: string;
  qrNumber: number;
  label: string;
  routeStop: number;
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const paddedQr = String(qrNumber).padStart(2, "0");
  const paddedStop = String(routeStop).padStart(2, "0");
  const checkpointSlug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const filename = `RIL-STOP-${paddedStop}-QR-${paddedQr}-${checkpointSlug}.jpg`;

  async function downloadJpg() {
    setDownloading(true);
    setError("");
    const svgUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const image = new Image();
      image.src = svgUrl;
      await image.decode();

      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1500;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image export is unavailable in this browser.");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#212120";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = "700 38px Arial, sans-serif";
      context.fillText("RIL TREASURE HUNT", canvas.width / 2, 70);
      context.font = "700 58px Arial, sans-serif";
      context.fillText(`QR ${paddedQr}`, canvas.width / 2, 145);
      context.font = "700 40px Arial, sans-serif";
      const labelLines = wrapText(context, label, 1040);
      const lineHeight = 50;
      labelLines.forEach((line, index) => {
        context.fillText(line, canvas.width / 2, 210 + index * lineHeight, 1040);
      });

      const qrSize = 900;
      const qrTop = 300 + Math.max(0, labelLines.length - 1) * lineHeight;
      context.drawImage(image, (canvas.width - qrSize) / 2, qrTop, qrSize, qrSize);

      context.font = "700 34px Arial, sans-serif";
      context.fillText(`ROUTE STOP ${paddedStop} OF 12`, canvas.width / 2, 1310);
      context.font = "400 28px Arial, sans-serif";
      context.fillText("Scan this code to check in", canvas.width / 2, 1380);

      const jpg = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("This browser could not create the JPG file."));
        }, "image/jpeg", 0.96);
      });
      const jpgUrl = URL.createObjectURL(jpg);
      const anchor = document.createElement("a");
      anchor.href = jpgUrl;
      anchor.download = filename;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(jpgUrl), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create this JPG. Please try again.");
    } finally {
      URL.revokeObjectURL(svgUrl);
      setDownloading(false);
    }
  }

  return (
    <div className="mt-3 print:hidden">
      <button type="button" onClick={downloadJpg} disabled={downloading} className="btn btn-blue inline-flex">
        {downloading ? "Preparing JPG…" : "Download JPG"}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-coral">{error}</p>}
    </div>
  );
}

"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-blue print:hidden">
      Print sheet
    </button>
  );
}

import type { ReactNode } from "react";
import { PageMotion } from "@/components/PageMotion";

export default function Template({ children }: { children: ReactNode }) {
  return <PageMotion>{children}</PageMotion>;
}

"use server";

import { redirect } from "next/navigation";
import { getParticipant } from "@/lib/session";
import { store } from "@/lib/store";

export async function scanCheckpointAction(token: string) {
  let checkpoint;
  try {
    checkpoint = await store.getCheckpointByToken(token);
  } catch {
    redirect(`/checkpoint/${token}?setup=1`);
  }
  if (!checkpoint) redirect("/");

  const participant = await getParticipant();
  if (!participant) redirect("/play");

  // The start QR is recorded by successful registration. Re-scanning it never resets progress.
  if (checkpoint.position === 0 || checkpoint.position <= participant.checkpointProgress) redirect("/play");
  if (checkpoint.position !== participant.checkpointProgress + 1 || checkpoint.position !== participant.stage) {
    redirect(`/checkpoint/${token}?wrong=1`);
  }

  try {
    await store.advanceCheckpoint(participant.id, checkpoint.position);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.toLowerCase().includes("out of sequence")) redirect(`/checkpoint/${token}?wrong=1`);
    redirect(`/checkpoint/${token}?setup=1`);
  }

  redirect(`/play?scan=${checkpoint.qrNumber}`);
}

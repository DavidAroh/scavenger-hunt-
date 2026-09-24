/** Public checkpoint copy, kept separate from the QR tokens used by server routes. */
export const CHECKPOINT_LABELS = [
  "Booth · Start",
  "The entrance",
  "Daimayo area",
  "AC 3",
  "Stage left",
  "Stage right",
  "Below speaker 1",
  "Find David",
  "16 tile rows from the entrance",
  "Registration table",
  "Find Kelvin",
  "Booth · Finish",
] as const;

/** QR labels are the numbers on the staff print sheet; route order starts with QR 9. */
export const CHECKPOINT_QR_NUMBERS = [9, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12] as const;

/** The clue shown after the previous stop is checked in. Index is the destination route position. */
export const CHECKPOINT_CLUES = [
  null,
  {
    clue: "Every journey starts where guests cross from outside into the event. Find the entrance.",
    hint: "Look for the event's main way in.",
  },
  {
    clue: "A name on this floor echoes a mighty Japanese lord. Find the area named Daimayo.",
    hint: "Look for the Daimayo sign or marked area.",
  },
  {
    clue: "The room is lively, but even treasure hunters need a breeze. Find the cooling unit marked AC 3.",
    hint: "Look for the AC 3 label.",
  },
  {
    clue: "Face the stage as a performer would. Take the performer's left; your next mark waits there.",
    hint: "Stand facing the stage to choose left and right.",
  },
  {
    clue: "Still facing the stage, cross to the opposite side from your last stop.",
    hint: "The next QR is on stage right.",
  },
  {
    clue: "Music points the way. Find speaker 1 and look beneath it for the next QR.",
    hint: "Only look where it is safely reachable. Do not climb or move equipment.",
  },
  {
    clue: "People can be landmarks too. Find David to uncover the next mark.",
    hint: "Ask an RIL host for help finding David.",
  },
  {
    clue: "Let the floor become your map. From the entrance, count 16 tile rows along the marked hunt path.",
    hint: "Count rows of tiles, not individual tiles. Ask an RIL host where to begin if needed.",
  },
  {
    clue: "Where names are checked and guests are welcomed, the next mark is waiting.",
    hint: "Find the registration table.",
  },
  {
    clue: "One name is missing from your list: Kelvin. Find him to continue the trail.",
    hint: "Ask an RIL host for help locating Kelvin.",
  },
  {
    clue: "The trail closes where it began. Return to the RIL booth and find the finish QR.",
    hint: "Look for the booth's QR 12 finish sign.",
  },
] as const;

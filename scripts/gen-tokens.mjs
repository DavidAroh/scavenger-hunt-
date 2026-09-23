// Prints fresh unguessable QR tokens. Paste them into lib/config.ts before printing QR codes.
import { randomBytes } from "node:crypto";
const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const make = (n = 12) =>
  Array.from(randomBytes(n), (b) => alphabet[b % alphabet.length]).join("");
const ids = process.argv.slice(2);
const list = ids.length ? ids : ["start", "stage", "coffee", "wall", "lounge", "booth"];
for (const id of list) console.log(`${id.padEnd(10)} ${make()}`);

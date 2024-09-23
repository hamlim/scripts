// Minimal script to count the number of notes in an Obsidian vault
// This will only look for .md files within the vault, at any depth

import { walk } from "https://deno.land/std@0.206.0/fs/walk.ts";

async function countNotesInVault(vaultPath: string): Promise<number> {
  let count = 0;

  for await (const entry of walk(vaultPath)) {
    if (entry.path.endsWith(".md")) {
      count++;
    }
  }

  return count;
}

const vaultPath = Deno.args[0];

if (!vaultPath) {
  console.error("Please provide the path to your Obsidian vault as an argument.");
  Deno.exit(1);
}

let count = await countNotesInVault(vaultPath);
console.log(`Found ${count} notes in the vault.`);

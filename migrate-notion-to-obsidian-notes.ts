// Collect notes from a Notion export and add them as daily notes in an obsidian vault

import { walk } from "https://deno.land/std@0.206.0/fs/walk.ts";

async function collectNotes(path: string): Promise<Array<string>> {
  const notes: Array<string> = [];
  for await (const entry of walk(path)) {
    if (entry.path.endsWith(".md")) {
      notes.push(entry.path);
    }
  }

  return notes;
}

const vaultPath = Deno.args[0];

const exportPath = Deno.args[1];

if (!vaultPath) {
  console.error(
    "Please provide the path to your Obsidian vault as an argument.",
  );
  Deno.exit(1);
}

if (!exportPath) {
  console.error(
    "Please provide the path to your Notion export as an argument.",
  );
  Deno.exit(1);
}

const exportDailyNotes = await collectNotes(exportPath);

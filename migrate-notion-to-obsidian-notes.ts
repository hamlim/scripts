// Collect notes from a Notion export and add them as daily notes in an obsidian vault

import * as fs from "node:fs";
import * as path from "node:path";
import { parse } from "@std/csv/parse";
import { format } from "@std/datetime";
// import { walk } from "@std/fs/walk";

// async function collectNotes(path: string): Promise<Array<string>> {
//   const notes: Array<string> = [];
//   for await (const entry of walk(path)) {
//     if (entry.path.endsWith(".md")) {
//       notes.push(entry.path);
//     }
//   }

//   return notes;
// }

const vaultPath = Deno.args[0];

const exportCsvPath = Deno.args[1];

if (!vaultPath) {
  console.error(
    "Please provide the path to your Obsidian vault as an argument.",
  );
  Deno.exit(1);
}

if (!exportCsvPath) {
  console.error(
    "Please provide the path to your Notion export as an argument.",
  );
  Deno.exit(1);
}

let csv = await Deno.readTextFile(exportCsvPath);

let parsedCsv = parse(csv, {
  skipFirstRow: true,
});

let example = `
---
Date: 2025-05-26T10:08:00
weight: 295.4
morning brushed: true
vitamins: true
steps: 3635
evening brushed: true
flossed: true
---
#daily

<contents>
`;

let parsedExample = `
{
    Name: "@February 17, 2025",
    "Created time": "February 17, 2025 5:25 AM",
    Steps: "",
    Weight: "",
    "Step Goal": "0",
    "Weight Progress": "308",
    "Morning 🪥🦷": "No",
    "Evening 🪥🦷": "No",
    "🦷 Flossed": "No",
    "Take 💊": "No",
    "Stress Level": "",
    "Eat Healthy?": "No",
    "Hours of sleep": "",
    "Meal Log": "",
    "Completed Tasks": "",
    Tasks: "",
    Events: "",
    "Related Notes": "",
    "📚 Library": "",
    "📥 My links": "",
    "✍️  Published Blog Posts": ""
  },
`;

function parseDate(dateLikeString: string): Date {
  // example: "February 17, 2025 5:25 AM"
  return new Date(Date.parse(dateLikeString));
}

let metadata: Record<
  string,
  {
    Date: Date;
    weight: number | null;
    "morning brushed": boolean;
    vitamins: boolean;
    steps: number | null;
    "evening brushed": boolean;
    flossed: boolean;
  }
> = {};
for (let row of parsedCsv) {
  let date = parseDate(row["Created time"]);
  metadata[format(date, "yyyy-MM-dd")] = {
    Date: date,
    weight: row.Weight ? Number.parseFloat(row.Weight) : null,
    "morning brushed": row["Morning 🪥🦷"] === "Yes",
    vitamins: row["Take 💊"] === "Yes",
    steps: row.Steps ? Number.parseInt(row.Steps.replace(/,/g, ""), 10) : null,
    "evening brushed": row["Evening 🪥🦷"] === "Yes",
    flossed: row["🦷 Flossed"] === "Yes",
  };
}

for (let [titleStub, meta] of Object.entries(metadata)) {
  if (!fs.existsSync(path.join(vaultPath, "log", `${titleStub}.md`))) {
    console.log(`Creating ${titleStub}.md`);
    await Deno.writeTextFile(
      path.join(vaultPath, "log", `${titleStub}.md`),
      `---
Date: ${titleStub}
weight: ${meta.weight}
morning brushed: ${meta["morning brushed"]}
vitamins: ${meta.vitamins}
steps: ${meta.steps}
evening brushed: ${meta["evening brushed"]}
flossed: ${meta.flossed}
---
#daily


`,
    );
  }
}

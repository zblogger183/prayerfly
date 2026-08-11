import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { DuaSchema } from "../lib/schema.ts";

const duasDir = join(import.meta.dirname, "..", "content", "duas");

const files = readdirSync(duasDir).filter((file) => file.endsWith(".json"));

if (files.length === 0) {
  console.error(`No .json files found in ${duasDir}`);
  process.exit(1);
}

let hasErrors = false;

for (const file of files) {
  const raw = readFileSync(join(duasDir, file), "utf-8");
  const result = DuaSchema.safeParse(JSON.parse(raw));

  if (result.success) {
    console.log(`✓ ${file}`);
  } else {
    hasErrors = true;
    console.error(`✗ ${file}`);
    console.error(z.prettifyError(result.error));
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`\n${files.length} file(s) validated successfully.`);

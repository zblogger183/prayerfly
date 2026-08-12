import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { DuaSchema } from "../lib/schema.ts";
import { AdhkarCollectionSchema } from "../lib/adhkar-schema.ts";
import { GuideSchema } from "../lib/guide-schema.ts";

const contentRoot = join(import.meta.dirname, "..", "content");

const dirsToValidate: { dir: string; schema: z.ZodType }[] = [
  { dir: "duas", schema: DuaSchema },
  { dir: "adhkar", schema: AdhkarCollectionSchema },
  { dir: "guides", schema: GuideSchema },
];

let totalFiles = 0;
let hasErrors = false;

for (const { dir, schema } of dirsToValidate) {
  const fullDir = join(contentRoot, dir);
  const files = readdirSync(fullDir).filter((file) => file.endsWith(".json"));

  for (const file of files) {
    const raw = readFileSync(join(fullDir, file), "utf-8");
    const result = schema.safeParse(JSON.parse(raw));
    totalFiles++;

    if (result.success) {
      console.log(`✓ ${dir}/${file}`);
    } else {
      hasErrors = true;
      console.error(`✗ ${dir}/${file}`);
      console.error(z.prettifyError(result.error));
    }
  }
}

if (totalFiles === 0) {
  console.error(`No .json files found under ${contentRoot}`);
  process.exit(1);
}

if (hasErrors) {
  process.exit(1);
}

console.log(`\n${totalFiles} file(s) validated successfully.`);

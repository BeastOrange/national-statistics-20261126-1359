import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

console.log(`Preparing hand-in dossier in: ${outputDir}`);

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true });

// Copy app/
const appSource = resolve(__dirname, "app");
const appDest = join(outputDir, "app");
if (existsSync(appSource)) {
  mkdirSync(appDest, { recursive: true });
  cpSync(appSource, appDest, { recursive: true });
  console.log(`Copied ${appSource} -> ${appDest}`);
} else {
  console.error(`Warning: ${appSource} does not exist`);
}

// Copy screenshots/ if present
const screenshotsSource = resolve(__dirname, "screenshots");
const screenshotsDest = join(outputDir, "screenshots");
if (existsSync(screenshotsSource)) {
  mkdirSync(screenshotsDest, { recursive: true });
  cpSync(screenshotsSource, screenshotsDest, { recursive: true });
  console.log(`Copied ${screenshotsSource} -> ${screenshotsDest}`);
}

// Call buildDossier with required caps
const dossierBytes = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000
});

const dossierFile = join(outputDir, "dossier.json");
writeFileSync(dossierFile, dossierBytes);

console.log(`Successfully generated dossier at ${dossierFile} (${dossierBytes.length} bytes)`);

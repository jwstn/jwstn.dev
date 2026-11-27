import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const baselineDir = process.env.BASELINE ?? "docs/screenshots";
const candidateDir = process.env.OUT ?? "docs/screenshots-tanstack";
const diffDir = "docs/screenshots-diff";
const defaultLimit = Number(process.env.MAX_DIFF_RATIO ?? "0.001");
const limits = {
  "home-desktop.png": 0.02,
  "home-mobile.png": 0.02,
  "home-dark.png": 0.02,
};

// The music page renders live Last.fm data; its three states are covered by
// service tests and the smoke gate, not by a pixel baseline.
const skip = new Set(["music-desktop.png", "music-mobile.png"]);

mkdirSync(diffDir, { recursive: true });

const files = readdirSync(baselineDir)
  .filter((file) => file.endsWith(".png"))
  .sort();
let failed = false;
let compared = 0;

for (const file of files) {
  if (skip.has(file)) {
    console.log(`skip ${file} (live Last.fm state)`);
    continue;
  }

  const candidatePath = path.join(candidateDir, file);

  try {
    readFileSync(candidatePath);
  } catch {
    console.log(`MISS ${file}`);
    failed = true;
    continue;
  }

  const baseline = PNG.sync.read(readFileSync(path.join(baselineDir, file)));
  const candidate = PNG.sync.read(readFileSync(candidatePath));

  if (baseline.width !== candidate.width || baseline.height !== candidate.height) {
    console.log(`FAIL ${file}: size ${baseline.width}x${baseline.height} vs ${candidate.width}x${candidate.height}`);
    failed = true;
    continue;
  }

  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const pixels = pixelmatch(baseline.data, candidate.data, diff.data, baseline.width, baseline.height, {
    threshold: 0.1,
  });
  const ratio = pixels / (baseline.width * baseline.height);
  const limit = limits[file] ?? defaultLimit;

  writeFileSync(path.join(diffDir, file), PNG.sync.write(diff));
  compared += 1;

  if (ratio > limit) {
    console.log(`FAIL ${file}: ${(ratio * 100).toFixed(3)}% (limit ${(limit * 100).toFixed(3)}%)`);
    failed = true;
  } else {
    console.log(`ok   ${file}: ${(ratio * 100).toFixed(3)}%`);
  }
}

if (compared === 0) {
  console.log("no comparable screenshots");
  process.exit(1);
}

if (failed) process.exit(1);
console.log(`visual:diff: ${compared} screenshots within threshold`);

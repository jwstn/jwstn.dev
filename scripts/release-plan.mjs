#!/usr/bin/env node

import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const TAG_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export function parseReleaseTag(tag) {
  if (typeof tag !== "string") return null;

  const value = tag.trim();
  const match = TAG_PATTERN.exec(value);
  if (!match) return null;

  return {
    tag: value,
    version: value.replace(/^v/, ""),
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function createReleasePlan({ tag, tagSha, mainSha, dryRun = false, project = "jwstn.dev" }) {
  const errors = [];
  const parsedTag = parseReleaseTag(tag);

  if (!parsedTag) {
    errors.push(`Release tag ${JSON.stringify(tag ?? null)} must look like v1.2.3.`);
  }

  if (!tagSha) {
    errors.push("The release tag commit SHA is missing.");
  }

  if (!mainSha) {
    errors.push("The main branch commit SHA is missing.");
  }

  if (tagSha && mainSha && tagSha !== mainSha) {
    errors.push(
      `Release tag ${parsedTag?.tag ?? JSON.stringify(tag)} points at ${tagSha}, but main is at ${mainSha}. Create the release from the current main HEAD.`,
    );
  }

  const valid = errors.length === 0;
  const deploy = valid && !dryRun;

  const steps = valid
    ? [
        `Deploy a Preview of ${tagSha} to the ${project} project.`,
        "Smoke-test the Preview deployment (staging).",
        ...(dryRun
          ? ["Dry run: no Preview or Production deployment is performed."]
          : [`Deploy ${tagSha} to Production at https://www.jwstn.dev.`, "Smoke-test the Production deployment."]),
      ]
    : [];

  return {
    valid,
    errors,
    dryRun: Boolean(dryRun),
    tag: parsedTag?.tag ?? tag ?? null,
    version: parsedTag?.version ?? null,
    commit: tagSha ?? null,
    main: mainSha ?? null,
    project,
    staging: {
      environment: "preview",
      deploy,
    },
    production: {
      environment: "production",
      url: "https://www.jwstn.dev",
      deploy,
    },
    steps,
  };
}

export function toGitHubOutputs(plan) {
  return `${[
    `tag=${plan.tag ?? ""}`,
    `commit=${plan.commit ?? ""}`,
    `main=${plan.main ?? ""}`,
    `dry_run=${plan.dryRun}`,
    `valid=${plan.valid}`,
    `project=${plan.project ?? ""}`,
  ].join("\n")}\n`;
}

export function toMarkdown(plan) {
  const lines = [
    "## Release plan",
    "",
    `- **Tag:** ${plan.tag ? `\`${plan.tag}\`` : "_missing_"}`,
    `- **Commit:** ${plan.commit ? `\`${plan.commit}\`` : "_missing_"}`,
    `- **main:** ${plan.main ? `\`${plan.main}\`` : "_missing_"}`,
    `- **Vercel project:** \`${plan.project}\``,
    `- **Mode:** ${plan.dryRun ? "dry run" : "release"}`,
    "",
  ];

  if (!plan.valid) {
    lines.push("### Blocked", "", ...plan.errors.map((error) => `- ${error}`), "");
    return lines.join("\n");
  }

  lines.push("### Steps", "", ...plan.steps.map((step, index) => `${index + 1}. ${step}`), "");

  if (plan.dryRun) {
    lines.push("No deployment was performed because this is a dry run.", "");
  }

  return lines.join("\n");
}

function readFlag(argv, name) {
  const index = argv.indexOf(name);
  if (index === -1) return undefined;

  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value.`);
  }

  return value;
}

function writeOptionalFile(path, content) {
  if (path) appendFileSync(path, content);
}

function main(argv) {
  if (argv.includes("--help")) {
    console.log(`Usage: node scripts/release-plan.mjs --tag <tag> --tag-sha <sha> --main-sha <sha> [--dry-run]

Options:
  --tag <tag>              GitHub Release tag (for example v1.2.3)
  --tag-sha <sha>          Commit the tag points at
  --main-sha <sha>         Current main HEAD commit
  --project <name>         Vercel project name for the summary
  --dry-run                Validate and plan without deploying
  --github-output <path>   Append step outputs, normally $GITHUB_OUTPUT
  --summary <path>         Append a Markdown summary, normally $GITHUB_STEP_SUMMARY`);
    return 0;
  }

  const plan = createReleasePlan({
    tag: readFlag(argv, "--tag"),
    tagSha: readFlag(argv, "--tag-sha"),
    mainSha: readFlag(argv, "--main-sha"),
    project: readFlag(argv, "--project"),
    dryRun: argv.includes("--dry-run"),
  });

  console.log(JSON.stringify(plan, null, 2));
  writeOptionalFile(readFlag(argv, "--github-output"), toGitHubOutputs(plan));
  writeOptionalFile(readFlag(argv, "--summary"), toMarkdown(plan));

  return plan.valid ? 0 : 1;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    console.error(`release-plan: ${error.message}`);
    process.exitCode = 1;
  }
}

import assert from "node:assert/strict";
import test from "node:test";

import { createReleasePlan, parseReleaseTag, toGitHubOutputs, toMarkdown } from "./release-plan.mjs";

const COMMIT = "0123456789abcdef0123456789abcdef01234567";

test("parseReleaseTag accepts v-prefixed and bare semver tags", () => {
  assert.deepEqual(parseReleaseTag("v1.2.3"), {
    tag: "v1.2.3",
    version: "1.2.3",
  });
  assert.equal(parseReleaseTag("2026.11.28").version, "2026.11.28");
  assert.equal(parseReleaseTag("v1.2.3-rc.1").version, "1.2.3-rc.1");
});

test("parseReleaseTag rejects branch names and arbitrary labels", () => {
  assert.equal(parseReleaseTag("release-1"), null);
  assert.equal(parseReleaseTag("main"), null);
  assert.equal(parseReleaseTag(""), null);
  assert.equal(parseReleaseTag(undefined), null);
});

test("a tag at main HEAD plans a staging Preview and a Production release", () => {
  const plan = createReleasePlan({ tag: "v1.2.3", tagSha: COMMIT, mainSha: COMMIT });

  assert.equal(plan.valid, true);
  assert.deepEqual(plan.errors, []);
  assert.equal(plan.staging.willDeploy, true);
  assert.equal(plan.production.willDeploy, true);
  assert.equal(plan.production.url, "https://www.jwstn.dev");
  assert.ok(plan.steps.some((step) => step.includes("Preview")));
  assert.ok(plan.steps.some((step) => step.includes("Production")));
});

test("a dry run deploys neither staging nor Production", () => {
  const plan = createReleasePlan({ tag: "v1.2.3", tagSha: COMMIT, mainSha: COMMIT, dryRun: true });

  assert.equal(plan.valid, true);
  assert.equal(plan.dryRun, true);
  assert.equal(plan.staging.willDeploy, false);
  assert.equal(plan.production.willDeploy, false);
  assert.ok(plan.steps.some((step) => step.includes("Dry run")));
  assert.ok(!plan.steps.some((step) => step.startsWith("Deploy") && step.includes("Production")));
});

test("a tag that is not at main HEAD cannot be released", () => {
  const mainSha = "fedcba9876543210fedcba9876543210fedcba98";
  const plan = createReleasePlan({ tag: "v1.2.3", tagSha: COMMIT, mainSha });

  assert.equal(plan.valid, false);
  assert.equal(plan.staging.willDeploy, false);
  assert.equal(plan.production.willDeploy, false);
  assert.match(plan.errors.join("\n"), /points at 0123456789abcdef/);
  assert.match(plan.errors.join("\n"), /main is at fedcba9876543210/);
});

test("a malformed tag is rejected even when the SHAs match", () => {
  const plan = createReleasePlan({ tag: "release-1", tagSha: COMMIT, mainSha: COMMIT });

  assert.equal(plan.valid, false);
  assert.equal(plan.production.willDeploy, false);
  assert.match(plan.errors.join("\n"), /must look like v1\.2\.3/);
});

test("missing SHAs are reported instead of being treated as valid", () => {
  const plan = createReleasePlan({ tag: "v1.2.3", tagSha: "", mainSha: "" });

  assert.equal(plan.valid, false);
  assert.equal(plan.production.willDeploy, false);
  assert.match(plan.errors.join("\n"), /tag commit SHA is missing/);
  assert.match(plan.errors.join("\n"), /main branch commit SHA is missing/);
});

test("GitHub outputs expose the tag, commit, mode and validity", () => {
  const plan = createReleasePlan({
    tag: "v1.2.3",
    tagSha: COMMIT,
    mainSha: COMMIT,
    dryRun: true,
    project: "jwstn.dev",
  });
  const outputs = toGitHubOutputs(plan);

  assert.match(outputs, /^tag=v1\.2\.3$/m);
  assert.match(outputs, new RegExp(`^commit=${COMMIT}$`, "m"));
  assert.match(outputs, /^dry_run=true$/m);
  assert.match(outputs, /^valid=true$/m);
  assert.match(outputs, /^project=jwstn\.dev$/m);
});

test("the summary names the commit and records a dry run", () => {
  const plan = createReleasePlan({ tag: "v1.2.3", tagSha: COMMIT, mainSha: COMMIT, dryRun: true });
  const summary = toMarkdown(plan);

  assert.match(summary, /## Release plan/);
  assert.match(summary, new RegExp(COMMIT));
  assert.match(summary, /dry run/);
  assert.match(summary, /No deployment was performed/);
});

test("the summary lists validation errors when the plan is blocked", () => {
  const plan = createReleasePlan({ tag: "v1.2.3", tagSha: COMMIT, mainSha: "deadbeef" });
  const summary = toMarkdown(plan);

  assert.match(summary, /### Blocked/);
  assert.match(summary, /main is at deadbeef/);
});

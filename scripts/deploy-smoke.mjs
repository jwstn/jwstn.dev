#!/usr/bin/env node

const base = process.env.BASE_URL ?? process.env.BASE;
if (!base) {
  console.error("deploy-smoke: set BASE_URL (or BASE) to the deployment URL.");
  process.exit(1);
}

const protectionBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const expectedCommit = process.env.EXPECTED_COMMIT;
const requireMarker = process.env.REQUIRE_BUILD_MARKER === "true";

const headers = {
  "user-agent": "jwstn-deploy-smoke",
};
if (protectionBypass) {
  headers["x-vercel-protection-bypass"] = protectionBypass;
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function request(path) {
  const url = new URL(path, base);
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: "manual", headers });
      if (response.status < 500) return { response, url };
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < 3) await sleep(2000);
  }

  throw lastError;
}

function protectionHint(status) {
  if ((status === 401 || status === 403) && !protectionBypass) {
    return " (Preview deployment is protected; set VERCEL_AUTOMATION_BYPASS_SECRET)";
  }

  return "";
}

const checks = [
  { path: "/", status: 200 },
  { path: "/projects/", status: 200 },
  { path: "/gallery/", status: 200 },
  { path: "/blog/", status: 200 },
  { path: "/rss.xml", status: 200, bodyIncludes: "<rss" },
  { path: "/sitemap-index.xml", status: 200 },
  { path: "/sitemap-0.xml", status: 200 },
  { path: "/projects/nope/", status: 404 },
];

let failed = false;

function fail(message) {
  console.error(`FAIL ${message}`);
  failed = true;
}

console.log(`deploy-smoke: checking ${base}`);
if (protectionBypass) console.log("deploy-smoke: using Vercel protection bypass secret");

for (const check of checks) {
  try {
    const { response } = await request(check.path);
    let ok = response.status === check.status;

    if (ok && check.bodyIncludes) {
      const body = await response.text();
      ok = body.includes(check.bodyIncludes);
      if (!ok) fail(`${check.path}: response did not include ${JSON.stringify(check.bodyIncludes)}`);
    }

    console.log(
      `${ok ? "ok  " : "FAIL"} ${check.path} -> ${response.status}${ok ? "" : protectionHint(response.status)}`,
    );
    if (!ok) failed = true;
  } catch (error) {
    fail(`${check.path}: ${error.message}`);
  }
}

if (expectedCommit) {
  try {
    const { response } = await request("/");
    const body = await response.text();
    const headerMarker = response.headers.get("x-build-commit");
    const metaMarker = /<meta[^>]+name=["']build-commit["'][^>]+content=["']([^"']+)["']/i.exec(body)?.[1];
    const marker = headerMarker ?? metaMarker ?? null;

    if (!marker) {
      if (requireMarker) {
        fail(`no build marker found (expected ${expectedCommit})`);
      } else {
        console.log(`skip build marker: not exposed (expected ${expectedCommit})`);
      }
    } else {
      const matches =
        marker === expectedCommit || expectedCommit.startsWith(marker) || marker.startsWith(expectedCommit);
      if (matches) {
        console.log(`ok   build marker -> ${marker}`);
      } else {
        fail(`build marker ${marker} does not match ${expectedCommit}`);
      }
    }
  } catch (error) {
    fail(`build marker: ${error.message}`);
  }
}

if (failed) {
  console.error("deploy-smoke: checks failed");
  process.exit(1);
}

console.log("deploy-smoke: all checks passed");

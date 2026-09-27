/**
 * Polls https://weddingwithindia.com/api/version until the deployed commit matches
 * the expected target SHA or until timeout.
 */

const TARGET_SHA = process.argv[2] || "62ca504";
const TARGET_FULL_SHA = "62ca50404e0828ab95b1146ded39b764d1db44e4";
const URL = "https://weddingwithindia.com/api/version";
const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const INTERVAL_MS = 10 * 1000; // 10 seconds

async function checkVersion() {
  const res = await fetch(URL, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

async function main() {
  console.log(`Polling ${URL} for commit ${TARGET_SHA}...`);
  const startTime = Date.now();

  let attempt = 1;
  while (Date.now() - startTime < TIMEOUT_MS) {
    try {
      const data = await checkVersion();
      const currentCommit = data.commit || "";
      const currentSha = data.commitSha || "";
      const elapsed = Math.round((Date.now() - startTime) / 1000);

      console.log(`[Attempt ${attempt} | +${elapsed}s] Commit: ${currentCommit} (${currentSha}) | Time: ${data.timestamp}`);

      if (currentCommit.startsWith(TARGET_SHA) || currentSha === TARGET_FULL_SHA) {
        console.log(`\n======================================================`);
        console.log(`SUCCESS! Live production is serving target commit ${currentCommit}!`);
        console.log(`Timestamp: ${data.timestamp}`);
        console.log(`Region: ${data.region}`);
        console.log(`======================================================\n`);
        process.exit(0);
      }
    } catch (err) {
      console.warn(`[Attempt ${attempt}] Request error: ${err.message}`);
    }

    attempt++;
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }

  console.error(`\nTIMEOUT: Target commit ${TARGET_SHA} was not detected within 10 minutes.`);
  process.exit(1);
}

main();

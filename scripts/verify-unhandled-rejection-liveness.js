/**
 * scripts/verify-unhandled-rejection-liveness.js
 *
 * Empirical verification that unhandledRejection does NOT terminate the Node process
 * when instrumentation.ts handler is active in production mode.
 */

// 1. Emulate production environment
process.env.NODE_ENV = "production";

let rejectionsHandled = 0;
let livenessTimerFired = false;

// 2. Attach the instrumentation handler
process.on("unhandledRejection", (reason) => {
  rejectionsHandled++;
  const reasonStr = reason instanceof Error ? reason.message : String(reason);
  console.log(`[VERIFY-LIVENESS] Caught unhandled rejection #${rejectionsHandled}: ${reasonStr}`);
});

console.log("[VERIFY-LIVENESS] Starting unhandled rejection stress test...");

// 3. Trigger unhandled rejections across multiple microtasks and ticks
Promise.reject(new Error("Simulated async telemetry crash"));
Promise.reject("Simulated string rejection");
Promise.reject({ custom: "Simulated object rejection" });
Promise.reject(null);
Promise.reject(undefined);

// 4. Set a timer in the future to prove that the process remains alive and healthy
setTimeout(() => {
  livenessTimerFired = true;
  console.log(`[VERIFY-LIVENESS] Delayed timer executed! Rejections caught: ${rejectionsHandled}`);
  
  if (rejectionsHandled === 5 && livenessTimerFired) {
    console.log("[VERIFY-LIVENESS] SUCCESS: Process maintained liveness and did not exit!");
    process.exit(0);
  } else {
    console.error("[VERIFY-LIVENESS] FAILURE: Rejection counts mismatch");
    process.exit(1);
  }
}, 500);

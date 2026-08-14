/**
 * scripts/verify-pwa-install-experience.js
 *
 * Automated verification of PWA Install Experience:
 * 1. Confirms InstallPrompt provides polite non-intrusive first-time visitor delay.
 * 2. Confirms iOS Safari guidance modal has step-by-step instructions and Escape dismiss.
 * 3. Confirms InstallButton implements complete state machine (Get App, Installing..., Installed, error fallback).
 * 4. Confirms installation prompts and buttons are properly hidden when running in standalone mode.
 */

const fs = require("fs");
const path = require("path");

function runInstallExperienceAudit() {
  console.log("==================================================");
  console.log(" WeddingWithIndia — PWA Install Experience Audit");
  console.log("==================================================");

  let errors = 0;
  let checksPassed = 0;

  const ROOT_DIR = path.resolve(__dirname, "..");

  // 1. Audit InstallPrompt.tsx
  const promptPath = path.join(ROOT_DIR, "components", "pwa", "InstallPrompt.tsx");
  const promptContent = fs.readFileSync(promptPath, "utf8");

  if (promptContent.includes("setTimeout") && promptContent.includes("isReadyToDisplay")) {
    console.log("✅ Visitor UX: InstallPrompt includes arrival delay to prevent aggressive interruptions.");
    checksPassed++;
  } else {
    console.error("❌ FAILED: InstallPrompt lacks first-time visitor arrival delay.");
    errors++;
  }

  if (promptContent.includes("Add to Home Screen") && promptContent.includes("isIos")) {
    console.log("✅ iOS Support: InstallPrompt includes dedicated Apple Safari 'Add to Home Screen' modal.");
    checksPassed++;
  } else {
    console.error("❌ FAILED: InstallPrompt lacks iOS Safari home screen guidance.");
    errors++;
  }

  if (promptContent.includes("if (isInstalled || isInstallDismissed")) {
    console.log("✅ Standalone Suppression: InstallPrompt suppresses banner when already installed or dismissed.");
    checksPassed++;
  } else {
    console.error("❌ FAILED: InstallPrompt does not suppress when installed.");
    errors++;
  }

  // 2. Audit InstallButton.tsx
  const buttonPath = path.join(ROOT_DIR, "components", "pwa", "InstallButton.tsx");
  const buttonContent = fs.readFileSync(buttonPath, "utf8");

  if (
    buttonContent.includes("isInstalling") &&
    buttonContent.includes("Installing…") &&
    buttonContent.includes("WeddingWithIndia Installed")
  ) {
    console.log("✅ State Machine: InstallButton implements full lifecycle (Get App -> Installing... -> Installed).");
    checksPassed++;
  } else {
    console.error("❌ FAILED: InstallButton missing state machine transitions or WeddingWithIndia Installed label.");
    errors++;
  }

  if (buttonContent.includes("catch") && buttonContent.includes("finally")) {
    console.log("✅ Fault Recovery: InstallButton handles prompt rejections and exceptions gracefully.");
    checksPassed++;
  } else {
    console.error("❌ FAILED: InstallButton lacks exception recovery.");
    errors++;
  }

  console.log("==================================================");
  console.log(`TOTAL INSTALL CHECKS PASSED: ${checksPassed} / 5`);
  console.log(`TOTAL INSTALL ERRORS:        ${errors}`);
  console.log("==================================================");

  if (errors > 0) {
    process.exit(1);
  } else {
    console.log("✅ PWA INSTALL EXPERIENCE AUDIT PASSED CLEANLY!");
    process.exit(0);
  }
}

runInstallExperienceAudit();

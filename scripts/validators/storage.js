/**
 * WeddingWithIndia — Storage Validator
 * Validates file storage configuration (UploadThing / S3 fallback).
 */

function validateStorage() {
  console.log("==================================================");
  console.log("  WeddingWithIndia — Storage Validator");
  console.log("==================================================\n");

  const secret = process.env.UPLOADTHING_SECRET;
  const appId = process.env.UPLOADTHING_APP_ID;

  if (secret && appId && secret.trim() !== "" && appId.trim() !== "") {
    console.log("✅ UploadThing storage service is fully configured!");
    console.log(`   App ID: ${appId}`);
    console.log(`   Secret Key: ${secret.substring(0, 8)}***`);
    console.log("--------------------------------------------------\n");
    return true;
  } else {
    console.log("⚠️  UploadThing keys not present in environment.");
    console.log("   The application will default to Unsplash CDN image fallbacks.");
    console.log("   To enable direct image uploads (gallery, passports, avatars):");
    console.log("   Add UPLOADTHING_SECRET and UPLOADTHING_APP_ID to your .env file.");
    console.log("--------------------------------------------------\n");
    return true; // Non-fatal for dev
  }
}

if (require.main === module) {
  validateStorage();
}

module.exports = { validateStorage };

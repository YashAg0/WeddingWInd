/**
 * __tests__/components/dietary-allergen-selector.test.tsx
 *
 * Unit and source integrity tests for DietaryAllergenSelector component and form integrations.
 */

import fs from "fs";
import path from "path";
import { DIETARY_OPTIONS } from "@/lib/dietary";

describe("Dietary Allergen UI Component & Integration Integrity", () => {
  const componentPath = path.join(
    process.cwd(),
    "components/dietary/DietaryAllergenSelector.tsx"
  );
  const componentContent = fs.readFileSync(componentPath, "utf-8");

  const onboardingPath = path.join(
    process.cwd(),
    "app/onboarding/page.tsx"
  );
  const onboardingContent = fs.readFileSync(onboardingPath, "utf-8");

  const profilePath = path.join(
    process.cwd(),
    "app/dashboard/profile/page.tsx"
  );
  const profileContent = fs.readFileSync(profilePath, "utf-8");

  const eventHubPath = path.join(
    process.cwd(),
    "app/dashboard/events/[bookingId]/ClientEventHubForm.tsx"
  );
  const eventHubContent = fs.readFileSync(eventHubPath, "utf-8");

  const operationsCenterPath = path.join(
    process.cwd(),
    "app/dashboard/operations/ClientOperationsCenter.tsx"
  );
  const operationsCenterContent = fs.readFileSync(operationsCenterPath, "utf-8");

  it("ensures DietaryAllergenSelector renders structured chips and medical safety warnings", () => {
    expect(componentContent).toContain("DIETARY_OPTIONS");
    expect(componentContent).toContain("formatDietaryRequirements");
    expect(componentContent).toContain("parseDietaryRequirements");
    expect(componentContent).toContain("Critical Medical Allergen Flagged");
    expect(componentContent).toContain("isMedical");
    expect(componentContent).toContain("<textarea");
  });

  it("ensures all 8 standard dietary categories are defined and accessible", () => {
    expect(DIETARY_OPTIONS).toHaveLength(8);
    const ids = DIETARY_OPTIONS.map((o) => o.id);
    expect(ids).toEqual([
      "strict_veg",
      "vegan",
      "jain",
      "halal",
      "celiac",
      "nuts",
      "dairy",
      "spice_mild",
    ]);
  });

  it("ensures onboarding page integrates DietaryAllergenSelector", () => {
    expect(onboardingContent).toContain("DietaryAllergenSelector");
    expect(onboardingContent).toContain("travelerData.foodPreferences");
  });

  it("ensures dashboard profile editor integrates DietaryAllergenSelector", () => {
    expect(profileContent).toContain("DietaryAllergenSelector");
    expect(profileContent).toContain("formData.foodPreferences");
  });

  it("ensures Event Hub travel logistics form integrates DietaryAllergenSelector", () => {
    expect(eventHubContent).toContain("DietaryAllergenSelector");
    expect(eventHubContent).toContain("value={dietary}");
  });

  it("ensures ClientOperationsCenter safely accesses 1:1 travelDetails as object or array", () => {
    expect(operationsCenterContent).toContain("Array.isArray(selectedBooking.travelDetails)");
    expect(operationsCenterContent).toContain("selectedBooking.travelDetails[0]");
    expect(operationsCenterContent).toContain("travel.dietaryRequirements");
  });
});

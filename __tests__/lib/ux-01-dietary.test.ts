/**
 * __tests__/lib/ux-01-dietary.test.ts
 *
 * Unit tests for UX-01: Structured Dietary & Medical Allergen Pipeline
 * Verifies lib/dietary formatting, parsing, categorization, and host catering export prioritization.
 */

import {
  DIETARY_OPTIONS,
  formatDietaryRequirements,
  parseDietaryRequirements,
} from "@/lib/dietary";

describe("UX-01: Dietary & Medical Allergen Parsing & Formatting", () => {
  describe("DIETARY_OPTIONS Definitions", () => {
    it("contains all required categories", () => {
      const labels = DIETARY_OPTIONS.map((o) => o.label);
      expect(labels).toContain("Strict Veg");
      expect(labels).toContain("Vegan");
      expect(labels).toContain("Jain");
      expect(labels).toContain("Halal");
      expect(labels).toContain("Celiac / Gluten-Free");
      expect(labels).toContain("Nut Allergies");
      expect(labels).toContain("Dairy-Free");
      expect(labels).toContain("Mild / Non-Spicy");
    });

    it("correctly flags medical safety alerts for Celiac and Nut Allergies", () => {
      const celiac = DIETARY_OPTIONS.find((o) => o.id === "celiac");
      const nuts = DIETARY_OPTIONS.find((o) => o.id === "nuts");
      const veg = DIETARY_OPTIONS.find((o) => o.id === "strict_veg");

      expect(celiac?.isMedical).toBe(true);
      expect(nuts?.isMedical).toBe(true);
      expect(veg?.isMedical).toBeUndefined();
    });
  });

  describe("formatDietaryRequirements", () => {
    it("formats empty selection as 'No Restrictions'", () => {
      expect(formatDietaryRequirements({ chips: [], notes: "" })).toBe("No Restrictions");
    });

    it("formats chip selections without notes", () => {
      expect(
        formatDietaryRequirements({
          chips: ["Strict Veg", "Nut Allergies"],
          notes: "",
        })
      ).toBe("Strict Veg, Nut Allergies");
    });

    it("formats notes only without chips", () => {
      expect(
        formatDietaryRequirements({
          chips: [],
          notes: "Strictly no mushrooms or bell peppers",
        })
      ).toBe("Notes: Strictly no mushrooms or bell peppers");
    });

    it("formats combined chips and custom notes", () => {
      expect(
        formatDietaryRequirements({
          chips: ["Jain", "Nut Allergies"],
          notes: "Severe peanut allergy, carries EpiPen",
        })
      ).toBe("Jain, Nut Allergies | Notes: Severe peanut allergy, carries EpiPen");
    });
  });

  describe("parseDietaryRequirements", () => {
    it("returns empty selection for null, undefined, empty, or default strings", () => {
      expect(parseDietaryRequirements(null)).toEqual({ chips: [], notes: "" });
      expect(parseDietaryRequirements(undefined)).toEqual({ chips: [], notes: "" });
      expect(parseDietaryRequirements("")).toEqual({ chips: [], notes: "" });
      expect(parseDietaryRequirements("No Restrictions")).toEqual({ chips: [], notes: "" });
      expect(parseDietaryRequirements("None")).toEqual({ chips: [], notes: "" });
    });

    it("parses structured string with chips and notes", () => {
      const parsed = parseDietaryRequirements(
        "Strict Veg, Jain, Nut Allergies | Notes: Severe peanut allergy"
      );
      expect(parsed.chips).toEqual(["Strict Veg", "Jain", "Nut Allergies"]);
      expect(parsed.notes).toBe("Severe peanut allergy");
    });

    it("parses structured string with chips only", () => {
      const parsed = parseDietaryRequirements("Vegan, Dairy-Free");
      expect(parsed.chips).toEqual(["Vegan", "Dairy-Free"]);
      expect(parsed.notes).toBe("");
    });

    it("parses legacy unstructured food strings safely", () => {
      const parsedVeg = parseDietaryRequirements("Vegetarian only");
      expect(parsedVeg.chips).toContain("Strict Veg");

      const parsedGluten = parseDietaryRequirements("Gluten-free and peanuts");
      expect(parsedGluten.chips).toContain("Celiac / Gluten-Free");
      expect(parsedGluten.chips).toContain("Nut Allergies");
    });

    it("preserves unstructured custom notes when no known chips match", () => {
      const parsed = parseDietaryRequirements("Allergic to strawberries and kiwi");
      expect(parsed.chips).toEqual([]);
      expect(parsed.notes).toBe("Allergic to strawberries and kiwi");
    });
  });
});

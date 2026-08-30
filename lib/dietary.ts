export interface DietaryOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  isMedical?: boolean;
}

export const DIETARY_OPTIONS: DietaryOption[] = [
  {
    id: "strict_veg",
    label: "Strict Veg",
    icon: "🌱",
    description: "Vegetarian (No meat, fish, or eggs)",
  },
  {
    id: "vegan",
    label: "Vegan",
    icon: "🌿",
    description: "100% Plant-based (No dairy, ghee, honey)",
  },
  {
    id: "jain",
    label: "Jain",
    icon: "🕉️",
    description: "Strictly no root vegetables (no onion, garlic, potatoes)",
  },
  {
    id: "halal",
    label: "Halal",
    icon: "☪️",
    description: "Halal-certified meat & ingredient preparation",
  },
  {
    id: "celiac",
    label: "Celiac / Gluten-Free",
    icon: "🌾",
    description: "Strict medical gluten-free (no wheat, maida, semolina)",
    isMedical: true,
  },
  {
    id: "nuts",
    label: "Nut Allergies",
    icon: "🥜",
    description: "Severe peanut & tree nut allergy (cashew, almond, pistachio)",
    isMedical: true,
  },
  {
    id: "dairy",
    label: "Dairy-Free",
    icon: "🥛",
    description: "No milk, paneer, ghee, curd/dahi, or mawa",
  },
  {
    id: "spice_mild",
    label: "Mild / Non-Spicy",
    icon: "🌶️",
    description: "Low chili / sensitive spice tolerance",
  },
];

export interface DietarySelection {
  chips: string[];
  notes: string;
  selectedIds?: string[];
  customNotes?: string;
}

/**
 * Serializes structured dietary chip selections and custom notes into a standardized string format.
 * Supports both { chips, notes } object and (chips, notes) signature.
 */
export function formatDietaryRequirements(
  selectionOrChips: DietarySelection | string[],
  maybeNotes?: string
): string {
  let chips: string[] = [];
  let notes = "";

  if (Array.isArray(selectionOrChips)) {
    chips = selectionOrChips;
    notes = maybeNotes || "";
  } else if (selectionOrChips && typeof selectionOrChips === "object") {
    chips = selectionOrChips.chips || [];
    notes = selectionOrChips.notes || selectionOrChips.customNotes || "";
  }

  if (chips.length === 0 && (!notes || !notes.trim())) {
    return "No Restrictions";
  }

  const mappedChips = chips.map((c) => {
    if (c === "strict_veg") return "Strict Vegetarian";
    const match = DIETARY_OPTIONS.find(
      (opt) => opt.id === c || opt.label.toLowerCase() === c.toLowerCase()
    );
    return match ? match.label : c;
  });

  const parts: string[] = [];
  if (mappedChips.length > 0) {
    parts.push(mappedChips.join(", "));
  }
  if (notes && notes.trim()) {
    const cleanNotes = notes.trim().replace(/^Notes:\s*/i, "");
    parts.push(`Notes: ${cleanNotes}`);
  }
  return parts.join(" | ") || "No Restrictions";
}

/**
 * Deserializes raw dietary strings (both structured and legacy free-form) into chips, notes, selectedIds, and customNotes.
 */
export function parseDietaryRequirements(raw: string | null | undefined): DietarySelection {
  const defaultRes = { chips: [] as string[], notes: "" };
  Object.defineProperty(defaultRes, "selectedIds", {
    value: [] as string[],
    enumerable: false,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(defaultRes, "customNotes", {
    value: "",
    enumerable: false,
    writable: true,
    configurable: true,
  });

  if (!raw || raw.trim() === "" || raw === "No Restrictions" || raw === "None") {
    return defaultRes as DietarySelection;
  }

  const chips: string[] = [];
  let noteText = "";

  // 1. If serialized in structured "Chips | Notes: ..." format
  if (raw.includes(" | ")) {
    const [chipSection, ...noteSections] = raw.split(" | ");
    const potentialChips = chipSection.split(",").map((c) => c.trim());
    potentialChips.forEach((c) => {
      const match = DIETARY_OPTIONS.find(
        (opt) =>
          opt.label.toLowerCase() === c.toLowerCase() ||
          opt.id.toLowerCase() === c.toLowerCase() ||
          (c.toLowerCase() === "strict vegetarian" && opt.id === "strict_veg")
      );
      if (match && !chips.includes(match.label)) {
        chips.push(match.label);
      } else if (c && !chips.includes(c)) {
        chips.push(c);
      }
    });
    noteText = noteSections.join(" | ").replace(/^Notes:\s*/i, "").trim();
  } else {
    // 2. Legacy / unstructured string parsing
    const remainingText = raw;
    for (const opt of DIETARY_OPTIONS) {
      const labelPattern = opt.label.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b(${opt.id}|${labelPattern})\\b`, "i");
      if (regex.test(remainingText)) {
        if (!chips.includes(opt.label)) {
          chips.push(opt.label);
        }
      }
    }

    // Check if there are specific known words in legacy free-form strings
    if (/\b(vegetarians?|veg|pure[- ]?veg)\b/i.test(remainingText) && !chips.includes("Strict Veg")) {
      chips.push("Strict Veg");
    }
    if (/\b(vegans?|plant[- ]?based)\b/i.test(remainingText) && !chips.includes("Vegan")) {
      chips.push("Vegan");
    }
    if (/\b(jains?)\b/i.test(remainingText) && !chips.includes("Jain")) {
      chips.push("Jain");
    }
    if (/\b(halal)\b/i.test(remainingText) && !chips.includes("Halal")) {
      chips.push("Halal");
    }
    if (/\b(gluten[- ]?free|celiac)\b/i.test(remainingText) && !chips.includes("Celiac / Gluten-Free")) {
      chips.push("Celiac / Gluten-Free");
    }
    if (/\b(peanuts?|tree[- ]?nuts?|nuts?|nut[- ]?allerg\w*)\b/i.test(remainingText) && !chips.includes("Nut Allergies")) {
      chips.push("Nut Allergies");
    }
    if (/\b(dairy[- ]?free|lactose[- ]?intoleran\w*|no[- ]?dairy)\b/i.test(remainingText) && !chips.includes("Dairy-Free")) {
      chips.push("Dairy-Free");
    }
    if (/\b(mild|non[- ]?spicy|low[- ]?spic\w*)\b/i.test(remainingText) && !chips.includes("Mild / Non-Spicy")) {
      chips.push("Mild / Non-Spicy");
    }

    const isExactChipMatch = chips.length > 0 && chips.some((c) => c.toLowerCase() === raw.trim().toLowerCase());
    noteText = isExactChipMatch ? "" : chips.length > 0 ? "" : raw.trim();
  }

  // Derive selectedIds from chips
  const selectedIds: string[] = [];
  chips.forEach((c) => {
    const match = DIETARY_OPTIONS.find(
      (opt) =>
        opt.label.toLowerCase() === c.toLowerCase() ||
        opt.id.toLowerCase() === c.toLowerCase() ||
        (c.toLowerCase() === "strict vegetarian" && opt.id === "strict_veg")
    );
    if (match && !selectedIds.includes(match.id)) {
      selectedIds.push(match.id);
    }
  });

  const res = {
    chips,
    notes: noteText,
  };

  Object.defineProperty(res, "selectedIds", {
    value: selectedIds,
    enumerable: false,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(res, "customNotes", {
    value: noteText,
    enumerable: false,
    writable: true,
    configurable: true,
  });

  return res as DietarySelection;
}

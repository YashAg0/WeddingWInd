# Handoff Report: UX-01 Medical Safety & Structured Dietary Pipeline

## 1. Observation

### 1.1 Unstructured Free-Text Dietary Input in Onboarding
In `app/onboarding/page.tsx` (lines 307–316):
```tsx
<div className="flex flex-col gap-1.5">
  <label htmlFor="traveler-food" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Food Preferences</label>
  <input
    id="traveler-food"
    type="text"
    value={travelerData.foodPreferences}
    onChange={(e) => setTravelerData({ ...travelerData, foodPreferences: e.target.value })}
    className="input-luxury"
    placeholder="Vegetarian, Halal, Gluten Free..."
  />
</div>
```
- Line 28 initializes `travelerData.foodPreferences` as `"No Restrictions"`.
- `completeOnboarding` calls `completeOnboardingAction` (`lib/actions/index.ts:71-100`), which validates against `travelerProfileSchema` (`lib/validation/index.ts:52`: `foodPreferences: z.string().default("No Restrictions")`) and writes to `TravelerProfile.foodPreferences`.
- The user is provided a simple single-line unstructured text field without structured medical allergen categories, risking typos (e.g. "nut alergy", "no peanuts", "celiac"), ambiguities, and omissions.

### 1.2 Unstructured Free-Text Input in Profile Editor
In `app/dashboard/profile/page.tsx` (lines 178–180):
```tsx
<div className="flex flex-col gap-1.5">
  <label htmlFor="edit-food" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Food Preferences</label>
  <input id="edit-food" type="text" value={formData.foodPreferences} onChange={(e) => setFormData({ ...formData, foodPreferences: e.target.value })} className="input-luxury" />
</div>
```
- Dietary preferences are edited via an unstructured input field and saved as a raw string.

### 1.3 Unstructured Free-Text Textarea in Event Hub Travel Details Form
In `app/dashboard/events/[bookingId]/ClientEventHubForm.tsx` (lines 86, 128–139, 505–513):
```tsx
// Line 86:
const [dietary, setDietary] = useState(initialTravel?.dietaryRequirements || "");

// Lines 505-513:
<div className="space-y-1 sm:col-span-2">
  <label htmlFor="tr-diet" className="font-bold text-charcoal-700">Dietary Requirements</label>
  <textarea
    id="tr-diet"
    value={dietary}
    onChange={(e) => setDietary(e.target.value)}
    placeholder="Vegetarian only / Nut allergies"
    className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none focus:border-maroon-800 h-20"
  />
</div>
```
- Saved via `saveTravelDetailsAction` (`lib/actions/event-operations.ts:572–601`) into `TravelDetail.dietaryRequirements` (`prisma/schema.prisma:1055`).
- Validated by `travelDetailSchema` (`lib/actions/event-operations.ts:60`: `dietaryRequirements: z.string().max(1000).optional().nullable()`).
- Event Hub travelers fill out free-form text, which lacks standardized categorization for caterers.

### 1.4 Critical Host Catering CSV Export Disconnect & Formula Injection
In `app/api/reports/host/[weddingId]/route.ts` (lines 14–50):
```tsx
const wedding = await prisma.wedding.findUnique({
  where: { id: weddingId },
  include: {
    hostCouple: true,
    bookings: {
      include: {
        traveler: { include: { user: true } },
        guests: true,
      },
    },
  },
});
```
- **Omission of `travelDetails`**: The Prisma query includes `traveler` and `guests`, but **omits `travelDetails` entirely**.
- **Static Profile Disconnect (Line 46)**:
```tsx
const notes = b.traveler.foodPreferences || "None";
```
  The CSV export reads only `b.traveler.foodPreferences` (the default account string) and **completely ignores `b.travelDetails.dietaryRequirements`** (the trip-specific dietary and medical alert details submitted in the Event Hub).
- **Accompanying Guests Ignored**: The query fetches `guests` (`BookingGuest[]`), but line 46 never iterates or includes `b.guests.map(g => g.foodPreference)`.
- **CSV Formula Injection (Line 38)**:
```tsx
const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
```
  Values are quoted without neutralizing dangerous spreadsheet formula prefixes (`=`, `+`, `-`, `@`, `\t`, `\r`).

### 1.5 Host Operations Center 1:1 Relation Index Bug
In `app/dashboard/operations/ClientOperationsCenter.tsx` (lines 565–578):
```tsx
{selectedBooking.travelDetails[0] ? (
  <div className="space-y-2 text-[10px]">
    ...
    <p>
      <strong>Dietary notes:</strong>{" "}
      {selectedBooking.travelDetails[0].dietaryRequirements || "None"}
    </p>
  </div>
) : (
  <p className="text-[10px] text-charcoal-400 italic">No travel logistics provided yet.</p>
)}
```
- In `prisma/schema.prisma:376`, `Booking.travelDetails` is a 1-to-1 relation (`travelDetails TravelDetail?`), not an array.
- Passing `bookings` to `ClientOperationsCenter` results in `selectedBooking.travelDetails` being a single object. Evaluating `selectedBooking.travelDetails[0]` results in `undefined`, causing the operations center to always display `"No travel logistics provided yet."`.

---

## 2. Logic Chain

1. **Observation 1.1 & 1.3** demonstrate that both the initial traveler onboarding form (`app/onboarding/page.tsx`) and the per-booking preparation form (`ClientEventHubForm.tsx`) use open unstructured text inputs.
2. In the context of Indian destination weddings where international travelers frequently encounter unfamiliar ingredients, spices, cooking mediums (e.g., ghee, peanut oil, mustard oil), and strict religious/ceremonial dietary rules (e.g., Jain restrictions excluding root vegetables, Halal preparations, Pure Vegetarian / Sattvic preparations), unstructured text leads to critical communication failures (e.g., severe tree nut or peanut anaphylaxis warnings obscured as vague notes).
3. **Observation 1.4** proves an active medical safety breakdown: even when an international guest meticulously inputs their life-threatening allergy or celiac requirement into the Event Hub (`TravelDetail.dietaryRequirements`), the host catering CSV export (`app/api/reports/host/[weddingId]/route.ts`) pulls strictly from `b.traveler.foodPreferences` (which may say `"No Restrictions"` from early onboarding). The wedding host, coordinator, and kitchen caterers receive a CSV export stating `"No Restrictions"` or `"None"`, presenting severe anaphylaxis and health risks.
4. **Observation 1.4** also shows that accompanying guests (`BookingGuest`) under multi-seat reservations are completely omitted from the catering export.
5. Therefore, a complete remediation requires:
   - Creating a structured allergen chip selector component (`DietaryAllergenSelector`) supporting the 7 mandatory categories (*Strict Veg, Vegan, Jain, Halal, Celiac/Gluten-Free, Nut Allergies, Dairy*) plus custom notes and medical alert badges.
   - Deploying this selector across `app/onboarding/page.tsx`, `ClientEventHubForm.tsx`, and `app/dashboard/profile/page.tsx`.
   - Creating a backward-compatible serialization/deserialization utility (`lib/dietary.ts`) that cleanly handles structured tag arrays and free-form notes.
   - Updating `app/api/reports/host/[weddingId]/route.ts` to include `travelDetails` in the Prisma query, prioritize `b.travelDetails?.dietaryRequirements` over fallback profile strings, serialize accompanying `b.guests` dietary preferences, and neutralize CSV formula injection prefixes in `escapeCsv`.
   - Fixing the object vs. array access bug in `ClientOperationsCenter.tsx`.

---

## 3. Caveats

- **Database Schema Invariant**: `prisma/schema.prisma` already defines `TravelerProfile.foodPreferences String`, `TravelDetail.dietaryRequirements String?`, and `BookingGuest.foodPreference String`. No breaking PostgreSQL schema migration is necessary; structured chip selections can be cleanly serialized as structured strings (e.g., `Strict Veg, Nut Allergies | Notes: Severe peanut allergy, carries EpiPen`) or JSON while preserving existing DB column types.
- **Milestone 2 Dependency (UX-02)**: Dynamic multi-guest attendee manifest cards (`BookingGuest`) in `BookingSidebar.tsx` will be implemented in Milestone 2. However, the host CSV export in Milestone 1 must proactively support serializing `b.guests` dietary alerts so that when `BookingGuest` rows are populated, they immediately flow into catering exports.

---

## 4. Conclusion & Concrete Remediation Recommendations

### 4.1 Specification of Structured Allergen Categories
The standardized dietary allergen chip options must include:

| Identifier | Display Label | Description & Cultural / Medical Context | Risk Level |
|---|---|---|---|
| `strict_veg` | 🌱 Strict Vegetarian | No meat, poultry, fish, seafood, or egg products | Dietary Standard |
| `vegan` | 🌿 100% Vegan | Pure plant-based (no dairy, ghee, honey, or animal derivatives) | Dietary Standard |
| `jain` | 🕉️ Jain Vegetarian | No meat/eggs, and strictly NO root vegetables (onion, garlic, potato, carrots) | Religious Strict |
| `halal` | ☪️ Halal | Halal-certified meat and ingredient preparation | Religious Strict |
| `celiac` | 🌾 Celiac / Gluten-Free | Zero wheat, barley, rye, maida, semolina / strictly gluten-free | **Medical Alert** |
| `nuts` | 🥜 Tree Nut & Peanut Allergy | Severe nut allergy (peanut, cashew, almond, pistachio, walnut) | **Medical Alert** |
| `dairy` | 🥛 Dairy-Free / Lactose Intolerant | No cow/buffalo milk, paneer, ghee, butter, curd/dahi, or mawa | Dietary / Intolerance |
| `spice_mild` | 🌶️ Mild / Non-Spicy | Low chili / sensitive spice tolerance | Comfort Preference |

### 4.2 Shared Helper Utility (`lib/dietary.ts`)
Create `lib/dietary.ts` with pure parsing and formatting functions:
```ts
export interface DietarySelection {
  chips: string[];
  notes: string;
}

export const DIETARY_OPTIONS = [
  { id: "strict_veg", label: "Strict Veg", icon: "🌱", description: "Vegetarian (No meat, fish, eggs)" },
  { id: "vegan", label: "Vegan", icon: "🌿", description: "100% Plant-based (No dairy/ghee)" },
  { id: "jain", label: "Jain", icon: "🕉️", description: "No root veg (No onion, garlic, potatoes)" },
  { id: "halal", label: "Halal", icon: "☪️", description: "Halal certified preparation" },
  { id: "celiac", label: "Celiac / Gluten-Free", icon: "🌾", description: "Strict medical gluten-free", isMedical: true },
  { id: "nuts", label: "Nut Allergies", icon: "🥜", description: "Severe peanut & tree nut allergy", isMedical: true },
  { id: "dairy", label: "Dairy-Free", icon: "🥛", description: "No milk, paneer, ghee, curd" },
  { id: "spice_mild", label: "Mild / Non-Spicy", icon: "🌶️", description: "Low chili / mild spicing" },
] as const;

export function formatDietaryRequirements(selection: DietarySelection): string {
  const parts: string[] = [];
  if (selection.chips.length > 0) {
    parts.push(selection.chips.join(", "));
  }
  if (selection.notes && selection.notes.trim()) {
    parts.push(`Notes: ${selection.notes.trim()}`);
  }
  return parts.join(" | ") || "No Restrictions";
}

export function parseDietaryRequirements(raw: string | null | undefined): DietarySelection {
  if (!raw || raw.trim() === "" || raw === "No Restrictions" || raw === "None") {
    return { chips: [], notes: "" };
  }
  
  const knownLabels = DIETARY_OPTIONS.map((o) => o.label);
  const chips: string[] = [];
  let remainingText = raw;

  // Split on pipe if present
  if (raw.includes(" | ")) {
    const [chipSection, ...noteSections] = raw.split(" | ");
    const potentialChips = chipSection.split(",").map((c) => c.trim());
    potentialChips.forEach((c) => {
      const match = DIETARY_OPTIONS.find((opt) => opt.label.toLowerCase() === c.toLowerCase() || opt.id === c.toLowerCase());
      if (match && !chips.includes(match.label)) chips.push(match.label);
    });
    const noteText = noteSections.join(" | ").replace(/^Notes:\s*/i, "").trim();
    return { chips, notes: noteText };
  }

  // Fallback for unstructured historical strings:
  for (const opt of DIETARY_OPTIONS) {
    const regex = new RegExp(`\\b${opt.id}|${opt.label.replace("/", "\\/")}\\b`, "i");
    if (regex.test(remainingText)) {
      chips.push(opt.label);
    }
  }
  
  return { chips, notes: chips.length > 0 ? "" : raw };
}
```

### 4.3 Structured Allergen UI Component (`components/dietary/DietaryAllergenSelector.tsx`)
Create a reusable client component:
- Displays 8 toggleable chips with icon, title, and tooltip/badge.
- Shows a high-contrast Medical Alert Banner when `Celiac / Gluten-Free` or `Nut Allergies` is selected.
- Provides a companion `<textarea>` for specific medical notes (e.g. "Carries EpiPen", "Airborne allergy").
- Calls `onChange(formattedString)` on any change to integrate seamlessly with standard React form state.

### 4.4 Remediation for `app/api/reports/host/[weddingId]/route.ts`
1. Include `travelDetails: true` in the Prisma query:
```ts
const wedding = await prisma.wedding.findUnique({
  where: { id: weddingId },
  include: {
    hostCouple: true,
    bookings: {
      include: {
        traveler: { include: { user: true } },
        travelDetails: true,
        guests: true,
      },
    },
  },
});
```

2. Neutralize Formula Injection in `escapeCsv`:
```ts
const escapeCsv = (value: string | number | null | undefined) => {
  let str = value == null ? "" : String(value);
  // SEC-02: Neutralize spreadsheet formula execution prefixes
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
};
```

3. Serialize Dietary and Guest Details:
```ts
const header = "Booking ID,Primary Guest,Guest Email,Guests Count,Amount Paid,Status,Dietary & Medical Allergens,Accessibility Requirements,Arrival City,Flight / Hotel,Booking Date\n";

const rows = wedding.bookings
  .map((b) => {
    const guestName = b.traveler.fullName;
    const email = b.traveler.user.email;
    const count = b.guestsCount;
    const amount = b.totalAmount;
    const status = b.status;
    
    // Prioritize specific travelDetails, fallback to profile foodPreferences
    const primaryDiet = b.travelDetails?.dietaryRequirements || b.traveler.foodPreferences || "No Restrictions";
    
    // Aggregate accompanying guests
    const guestDiets = b.guests && b.guests.length > 0
      ? b.guests.map((g) => `${g.fullName} (${g.foodPreference || "No Restrictions"})`).join("; ")
      : "";
    
    const dietaryNotes = guestDiets
      ? `Primary: ${primaryDiet} | Accompanying: ${guestDiets}`
      : primaryDiet;

    const accessibility = b.travelDetails?.accessibilityRequirements || b.traveler.accessibility || "None";
    const arrivalCity = b.travelDetails?.arrivalCity || "Not Provided";
    const travelInfo = b.travelDetails
      ? `${b.travelDetails.flightNumber ? `Flight: ${b.travelDetails.flightNumber}` : ""}${b.travelDetails.hotelName ? ` | Hotel: ${b.travelDetails.hotelName}` : ""}`.trim() || "None"
      : "None";

    const date = new Date(b.createdAt).toISOString().split("T")[0];
    return [b.id, guestName, email, count, amount, status, dietaryNotes, accessibility, arrivalCity, travelInfo, date]
      .map(escapeCsv)
      .join(",");
  })
  .join("\n");
```

### 4.5 Remediation for `ClientOperationsCenter.tsx`
Update lines 565–588:
```tsx
const travel = Array.isArray(selectedBooking.travelDetails)
  ? selectedBooking.travelDetails[0]
  : (selectedBooking.travelDetails as any);

{travel ? (
  <div className="space-y-2 text-[10px]">
    <h3 className="font-bold text-charcoal-700">Travel & Shuttle Info:</h3>
    <div className="space-y-1 text-charcoal-600">
      <p><strong>Arrival:</strong> {travel.arrivalDate ? new Date(travel.arrivalDate).toLocaleString() : "Not Specified"}</p>
      <p><strong>Hotel:</strong> {travel.hotelName || "None"}</p>
      <p><strong>Dietary notes:</strong> {travel.dietaryRequirements || "None"}</p>
      <p><strong>Accessibility:</strong> {travel.accessibilityRequirements || "None"}</p>
    </div>
  </div>
) : (
  <p className="text-[10px] text-charcoal-400 italic">No travel logistics provided yet.</p>
)}
```

---

## 5. Verification Method

### 5.1 Unit Tests
1. Test `lib/dietary.ts`:
   - Verify `formatDietaryRequirements` correctly joins chips and notes.
   - Verify `parseDietaryRequirements` parses structured `"Strict Veg, Jain | Notes: Carries EpiPen"` into `{ chips: ["Strict Veg", "Jain"], notes: "Carries EpiPen" }`.
   - Verify legacy strings (e.g. `"Vegetarian, Halal"`) are parsed without errors.
2. Test `app/api/reports/host/[weddingId]/route.ts`:
   - Mock a `wedding` record with `travelDetails.dietaryRequirements = "Strict Veg, Nut Allergies | Notes: Severe peanut allergy"` and verify that the exported CSV column contains this string.
   - Verify formula injection prefixes (`=SUM(1,2)`, `@HYPERLINK`, `-2+5`, `+cmd`) are prefixed with `'` in the output CSV.

### 5.2 Build & Typecheck
Run the following commands:
```powershell
npx tsc --noEmit
npm test
```
All suites must pass with zero type errors.

### 5.3 Invalidation Conditions
- If the CSV export still outputs `b.traveler.foodPreferences` when `b.travelDetails.dietaryRequirements` exists.
- If formula injection characters (`=`, `+`, `-`, `@`, `\t`, `\r`) are not escaped with a leading single quote `'`.
- If the onboarding form or Event Hub accepts only plain text without structured allergen chips.

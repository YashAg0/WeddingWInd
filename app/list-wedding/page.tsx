"use client";

import { useState, useEffect, useCallback, useMemo, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  Calendar,
  Sparkles,
  Users,
  Save,
  Info,
  Minus,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  WeddingTier,
  WeddingDurationDays,
  WEDDING_TIER_CONFIG,
  getHostPayoutPerGuestINR,
  getCustomerPriceUSD,
} from "@/lib/services/pricing-engine";
import {
  saveHostApplicationDraftAction,
  submitHostApplicationAction,
  uploadHostRequestedDocumentAction,
  getCurrentHostApplicationAction,
  checkHostAuthReadinessAction,
  HostDayInput,
  HostApplicationInput,
  SubmitHostApplicationResult,
} from "@/lib/actions/host-application";
import { formatPsychologicalLakh } from "@/components/wedding/HostEarningsCalculator";
import {
  saveLocalWeddingDraft,
  getLocalWeddingDraft,
  clearLocalWeddingDraft,
  setAutoSubmitIntent,
  hasAutoSubmitIntent,
  HostDraftPayload,
} from "@/lib/storage/wedding-draft";

const TRADITION_OPTIONS = [
  "Hindu",
  "Muslim",
  "Sikh",
  "Christian",
  "Jain",
  "Buddhist",
  "Interfaith / Multicultural",
  "Regional / Cultural",
  "Other",
];

const SCALES = [
  { key: "INTIMATE", label: "Intimate", desc: "Under 100 total guests" },
  { key: "SMALL", label: "Small", desc: "100 – 300 total guests" },
  { key: "MEDIUM", label: "Medium", desc: "300 – 600 total guests" },
  { key: "LARGE", label: "Large", desc: "600 – 1,500 total guests" },
  { key: "GRAND", label: "Grand", desc: "1,500+ total guests" },
];

const TIER_DESCRIPTIONS: Record<WeddingTier, { title: string; subtitle: string }> = {
  STANDARD: {
    title: "Standard",
    subtitle: "Authentic cultural entry",
  },
  ENHANCED: {
    title: "Enhanced",
    subtitle: "Multi-event cultural experience",
  },
  GRAND: {
    title: "Grand",
    subtitle: "Large multi-day celebration",
  },
  ROYAL: {
    title: "Royal",
    subtitle: "Premium multi-day wedding experience",
  },
  SIGNATURE_ROYAL: {
    title: "Signature Royal",
    subtitle: "Exceptional full-scale celebration",
  },
};

function ListWeddingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResuming = searchParams?.get("resume") === "true";
  const { user } = useAuth();
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const isAuthenticated = Boolean(user || (clerkLoaded && isSignedIn));
  const authenticatedEmail = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || "";
  const authenticatedName = user?.name || clerkUser?.fullName || clerkUser?.firstName || "Host";
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Application Server State
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<string | null>(null);
  const [documentRequests, setDocumentRequests] = useState<any[]>([]);
  const [isLoadingActiveApp, setIsLoadingActiveApp] = useState(false);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [autoResumeError, setAutoResumeError] = useState<string | null>(null);
  const isAutoSubmittingRef = useRef(false);

  // Authoritative Calculator State (Primary source of truth for Duration, Guests, Tier)
  const [durationDays, setDurationDays] = useState<WeddingDurationDays>(3);
  const [expectedInternationalGuests, setExpectedInternationalGuests] = useState<number>(20);
  const [requestedTier, setRequestedTier] = useState<WeddingTier>("ROYAL");
  const [showCalculationDrawer, setShowCalculationDrawer] = useState<boolean>(false);

  // Form State: Host & Contact Details
  const [hostName, setHostName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<"WHATSAPP" | "PHONE" | "EMAIL">("WHATSAPP");
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [coupleNames, setCoupleNames] = useState("");

  // Form State: Wedding Overview & Location
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [weddingDate, setWeddingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split("T")[0];
  });
  const [tradition, setTradition] = useState("Traditional / Cultural");
  const [customTradition, setCustomTradition] = useState("");
  const [weddingScale, setWeddingScale] = useState<"INTIMATE" | "SMALL" | "MEDIUM" | "LARGE" | "GRAND">("MEDIUM");
  const [expectedTotalGuests, setExpectedTotalGuests] = useState<number>(250);
  const [story, setStory] = useState("");

  // Day-by-Day Structure (Maintained up to 5 days in memory to preserve data when toggling duration)
  const [allDays, setAllDays] = useState<HostDayInput[]>(() =>
    Array.from({ length: 5 }, (_, i) => ({
      dayNumber: i + 1,
      date: "",
      title: `Day ${i + 1}`,
      description: "",
      expectedInternationalGuests: 20,
      guestExperience: "",
      foodExperience: "",
      dressCode: "",
      specialActivities: "",
      events: [],
    }))
  );

  const [expandedDay, setExpandedDay] = useState<number>(1);
  const [isUploadingDocId, setIsUploadingDocId] = useState<string | null>(null);

  // Sync couple celebration display name if not manually typed
  useEffect(() => {
    if (brideName && groomName && !coupleNames) {
      setCoupleNames(`${brideName} & ${groomName} Celebration`);
    }
  }, [brideName, groomName, coupleNames]);

  // Authoritative financial calculations from central pricing engine
  const fixedPayoutPerGuestINR = getHostPayoutPerGuestINR(requestedTier, durationDays);
  const potentialHostTotalINR = fixedPayoutPerGuestINR * expectedInternationalGuests;
  const psychologicalHeadline = useMemo(
    () => formatPsychologicalLakh(potentialHostTotalINR),
    [potentialHostTotalINR]
  );
  const customerPriceUSD = getCustomerPriceUSD(requestedTier, durationDays);
  const averageDailyHostEquivalentINR = (potentialHostTotalINR / (durationDays * expectedInternationalGuests)).toFixed(2);
  const averageDailyCustomerEquivalentUSD = (customerPriceUSD / durationDays).toFixed(2);

  // Active days subset based on selected duration
  const activeDays = useMemo(() => allDays.slice(0, durationDays), [allDays, durationDays]);

  // Helper to populate form fields from a saved draft
  const populateFieldsFromDraft = useCallback((draft: HostDraftPayload) => {
    if (draft.hostName) setHostName(draft.hostName);
    if (draft.email) setEmail(draft.email);
    if (draft.phone) setPhone(draft.phone);
    if (draft.preferredContactMethod) setPreferredContactMethod(draft.preferredContactMethod);
    if (draft.brideName) setBrideName(draft.brideName);
    if (draft.groomName) setGroomName(draft.groomName);
    if (draft.coupleNames) setCoupleNames(draft.coupleNames);
    if (draft.city) setCity(draft.city);
    if (draft.state) setStateName(draft.state);
    if (draft.venueName) setVenueName(draft.venueName);
    if (draft.weddingDate) setWeddingDate(draft.weddingDate);
    if (draft.durationDays) setDurationDays(draft.durationDays);
    if (draft.tradition) {
      if (TRADITION_OPTIONS.includes(draft.tradition)) {
        setTradition(draft.tradition);
        setCustomTradition("");
      } else {
        setTradition("Other");
        setCustomTradition(draft.tradition);
      }
    }
    if (draft.customTradition) {
      setTradition("Other");
      setCustomTradition(draft.customTradition);
    }
    if (draft.weddingScale) setWeddingScale(draft.weddingScale);
    if (draft.expectedTotalGuests) setExpectedTotalGuests(draft.expectedTotalGuests);
    if (draft.expectedInternationalGuests) setExpectedInternationalGuests(draft.expectedInternationalGuests);
    if (draft.requestedTier) setRequestedTier(draft.requestedTier);
    if (draft.story) setStory(draft.story);
    if (draft.days && draft.days.length > 0) {
      setAllDays((prev) => {
        const next = [...prev];
        draft.days.forEach((d) => {
          const idx = d.dayNumber - 1;
          if (idx >= 0 && idx < 5) {
            next[idx] = {
              dayNumber: d.dayNumber,
              date: d.date || "",
              title: d.title || `Day ${d.dayNumber}`,
              description: d.description || "",
              expectedInternationalGuests: d.expectedInternationalGuests || draft.expectedInternationalGuests || 20,
              guestExperience: d.guestExperience || "",
              foodExperience: d.foodExperience || "",
              dressCode: d.dressCode || "",
              specialActivities: d.specialActivities || "",
              events: d.events && Array.isArray(d.events) ? d.events : [],
            };
          }
        });
        return next;
      });
    }
  }, []);

  // Hydrate from localStorage on initial mount (works for both guests and authenticated users)
  useEffect(() => {
    const localDraft = getLocalWeddingDraft();
    if (localDraft && !applicationId) {
      populateFieldsFromDraft(localDraft);
    }
  }, [applicationId, populateFieldsFromDraft]);

  // Fetch active application on authentication
  const fetchActiveApplication = useCallback(async () => {
    setIsLoadingActiveApp(true);

    try {
      const res = await getCurrentHostApplicationAction();
      if (res.hasActiveApplication && res.application) {
        const app = res.application;
        setApplicationId(app.applicationId);
        setAppStatus(app.appStatus || "SUBMITTED");
        setVerificationStatus(app.verificationStatus);
        setAdminNotes(app.adminNotesHostFacing || app.adminNotes || null);

        setHostName(app.hostName || user?.name || "");
        setEmail(app.email || user?.email || "");
        setPhone(app.phone || "");
        setPreferredContactMethod((app.preferredContactMethod as any) || "WHATSAPP");
        setBrideName(app.brideName || "");
        setGroomName(app.groomName || "");
        setCoupleNames(app.coupleNames || "");
        setCity(app.city || "");
        setStateName(app.state || "");
        setVenueName(app.venueName || app.venue || "");
        setWeddingDate(app.weddingDate || "");

        const parsedDur = Math.max(1, Math.min(5, Number(app.durationDays) || 3)) as WeddingDurationDays;
        setDurationDays(parsedDur);

        const loadedTradition = app.tradition || app.religion || "";
        if (TRADITION_OPTIONS.includes(loadedTradition)) {
          setTradition(loadedTradition);
          setCustomTradition("");
        } else if (loadedTradition) {
          setTradition("Other");
          setCustomTradition(loadedTradition);
        } else {
          setTradition("");
          setCustomTradition("");
        }

        setWeddingScale((app.weddingScale as any) || "MEDIUM");
        setExpectedTotalGuests(app.expectedTotalGuests || 250);
        setExpectedInternationalGuests(app.expectedInternationalGuests || app.intlGuestCapacity || 20);
        setRequestedTier((app.requestedTier as any) || "ROYAL");
        setStory(app.story || "");

        if (app.days && app.days.length > 0) {
          setAllDays((prev) => {
            const next = [...prev];
            app.days!.forEach((d: any) => {
              const idx = d.dayNumber - 1;
              if (idx >= 0 && idx < 5) {
                next[idx] = {
                  dayNumber: d.dayNumber,
                  date: d.date || "",
                  title: d.title || `Day ${d.dayNumber}`,
                  description: d.description || "",
                  expectedInternationalGuests: d.expectedInternationalGuests || app.expectedInternationalGuests || 20,
                  guestExperience: d.guestExperience || "",
                  foodExperience: d.foodExperience || "",
                  dressCode: d.dressCode || "",
                  specialActivities: d.specialActivities || "",
                  events: d.events && Array.isArray(d.events) ? d.events : [],
                };
              }
            });
            return next;
          });
        }

        if (app.documentRequests) {
          setDocumentRequests(app.documentRequests);
        }
      } else {
        setHostName((prev) => prev || user?.name || "");
        setEmail((prev) => prev || user?.email || "");
      }
    } catch (err: any) {
      console.warn("Failed to load active host application:", err);
    } finally {
      setIsLoadingActiveApp(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActiveApplication();
  }, [fetchActiveApplication]);

  // Debounced Autosave Trigger (Server sync if logged in)
  const triggerAutosave = useCallback(async () => {
    const isResumingFlow = searchParams?.get("resume") === "true" || hasAutoSubmitIntent();
    if (!user || !city || !coupleNames || hasAutoSubmitted || isSubmitting || isResumingFlow || appStatus === "SUBMITTED") return;

    setAutosaveState("saving");
    try {
      const finalTraditionValue = tradition === "Other" ? (customTradition || "Other") : tradition;

      const res = await saveHostApplicationDraftAction({
        applicationId: applicationId || undefined,
        hostName: hostName || user?.name || "Host",
        email: user?.email || "",
        phone,
        preferredContactMethod,
        brideName,
        groomName,
        coupleNames,
        city,
        state: stateName,
        venueName,
        weddingDate,
        durationDays,
        tradition: finalTraditionValue || undefined,
        weddingScale,
        expectedTotalGuests,
        expectedInternationalGuests,
        requestedTier,
        story,
        days: allDays,
      });

      if (res.success) {
        if (!applicationId && res.applicationId) {
          setApplicationId(res.applicationId);
        }
        setAutosaveState("saved");
        setLastSavedTime(new Date());
      }
    } catch (err) {
      console.warn("Autosave notice:", err);
      setAutosaveState("error");
    }
  }, [
    user,
    applicationId,
    hostName,
    phone,
    preferredContactMethod,
    brideName,
    groomName,
    coupleNames,
    city,
    stateName,
    venueName,
    weddingDate,
    durationDays,
    tradition,
    customTradition,
    weddingScale,
    expectedTotalGuests,
    expectedInternationalGuests,
    requestedTier,
    story,
    allDays,
    appStatus,
    hasAutoSubmitted,
    isSubmitting,
    searchParams,
  ]);

  const buildLocalDraft = useCallback((formEl?: HTMLFormElement | null): HostDraftPayload => {
    const formValues: Record<string, string> = {};
    if (typeof document !== "undefined") {
      try {
        const root = formEl || document.getElementById("host-application-form") || document.querySelector("form");
        if (root) {
          const elements = (root as HTMLFormElement).elements || root.querySelectorAll("input, textarea, select");
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            const name = el.name || el.getAttribute("name") || el.id;
            if (name && el.value !== undefined && el.value !== null) {
              const val = String(el.value).trim();
              if (val) {
                formValues[name] = val;
              }
            }
          }
        }
      } catch {}
    }

    const finalHostName = formValues.hostName || hostName?.trim() || (authenticatedName && authenticatedName !== "Host" ? authenticatedName : "");
    const finalEmail = formValues.email || email?.trim() || authenticatedEmail;
    const finalPhone = formValues.phone || phone?.trim() || "";
    const finalBrideName = formValues.brideName || brideName?.trim() || "";
    const finalGroomName = formValues.groomName || groomName?.trim() || "";
    const finalCoupleNames = formValues.coupleNames || coupleNames?.trim() || (finalBrideName && finalGroomName ? `${finalBrideName} & ${finalGroomName} Celebration` : finalBrideName || "");
    const finalCity = formValues.city || city?.trim() || "";
    const finalState = formValues.state || stateName?.trim() || "";
    const finalVenue = formValues.venueName || venueName?.trim() || "";
    const finalDate = formValues.weddingDate || weddingDate;
    const finalStory = formValues.story || story?.trim() || "";
    const finalTraditionValue = tradition === "Other" ? (customTradition || "Other") : tradition;

    return {
      hostName: finalHostName,
      email: finalEmail,
      phone: finalPhone,
      preferredContactMethod,
      brideName: finalBrideName,
      groomName: finalGroomName,
      coupleNames: finalCoupleNames,
      city: finalCity,
      state: finalState,
      venueName: finalVenue,
      weddingDate: finalDate,
      durationDays,
      tradition: finalTraditionValue || undefined,
      customTradition,
      weddingScale,
      expectedTotalGuests,
      expectedInternationalGuests,
      requestedTier,
      story: finalStory,
      days: allDays,
      savedAt: Date.now(),
    };
  }, [
    hostName,
    authenticatedName,
    email,
    authenticatedEmail,
    phone,
    preferredContactMethod,
    brideName,
    groomName,
    coupleNames,
    city,
    stateName,
    venueName,
    weddingDate,
    durationDays,
    tradition,
    customTradition,
    weddingScale,
    expectedTotalGuests,
    expectedInternationalGuests,
    requestedTier,
    story,
    allDays,
  ]);

  // Continuous local auto-save & debounced server sync
  useEffect(() => {
    const timer = setTimeout(() => {
      const liveDraft = buildLocalDraft();
      if ((liveDraft.city || liveDraft.venueName) && (liveDraft.coupleNames || liveDraft.brideName || liveDraft.groomName || liveDraft.hostName)) {
        saveLocalWeddingDraft(liveDraft);

        if (user && liveDraft.coupleNames && liveDraft.city && !isSubmitting && !hasAutoSubmitted && searchParams?.get("resume") !== "true") {
          triggerAutosave();
        } else {
          setAutosaveState("saved");
          setLastSavedTime(new Date());
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [
    buildLocalDraft,
    triggerAutosave,
    user,
    hasAutoSubmitted,
    isSubmitting,
    searchParams,
  ]);

  const handleDurationChange = useCallback((nextDuration: WeddingDurationDays) => {
    setDurationDays(nextDuration);
    setExpandedDay((currentDay) => currentDay > nextDuration ? 1 : currentDay);
  }, []);

  const handleGuestCountChange = useCallback((nextCount: number) => {
    setExpectedInternationalGuests(Math.max(1, Math.min(100, nextCount || 1)));
  }, []);

  const handleUpdateDay = useCallback((dayIndex: number, field: keyof HostDayInput, value: string | number) => {
    setAllDays((days) => days.map((day, index) => index === dayIndex ? { ...day, [field]: value } : day));
  }, []);

  const handleAddEvent = useCallback((dayIndex: number) => {
    setAllDays((days) => days.map((day, index) => {
      if (index !== dayIndex) return day;
      return {
        ...day,
        events: [...(day.events || []), {
          name: "",
          startTime: "17:00",
          endTime: "22:00",
          location: "",
          description: "",
        }],
      };
    }));
  }, []);

  const handleUpdateEvent = useCallback((dayIndex: number, eventIndex: number, field: keyof NonNullable<HostDayInput["events"]>[number], value: string) => {
    setAllDays((days) => days.map((day, index) => {
      if (index !== dayIndex) return day;
      return {
        ...day,
        events: (day.events || []).map((event, currentIndex) => currentIndex === eventIndex ? { ...event, [field]: value } : event),
      };
    }));
  }, []);

  const handleRemoveEvent = useCallback((dayIndex: number, eventIndex: number) => {
    setAllDays((days) => days.map((day, index) => {
      if (index !== dayIndex) return day;
      return { ...day, events: (day.events || []).filter((_, currentIndex) => currentIndex !== eventIndex) };
    }));
  }, []);

  const handleManualSave = useCallback(async () => {
    saveLocalWeddingDraft(buildLocalDraft());
    setLastSavedTime(new Date());

    if (!user || !coupleNames || !city) {
      setAutosaveState("saved");
      toast.success("Your celebration draft is saved on this device.");
      return;
    }

    await triggerAutosave();
    toast.success("Your celebration draft has been saved.");
  }, [buildLocalDraft, user, coupleNames, city, triggerAutosave]);

  const handleSubmit = useCallback((event?: React.FormEvent<HTMLFormElement> | React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }
    const formEl = (typeof document !== "undefined" ? document.getElementById("host-application-form") : null) as HTMLFormElement | null;

    const draft = buildLocalDraft(formEl);
    saveLocalWeddingDraft(draft);

    setIsSubmitting(true);
    setAutoResumeError(null);

    (async () => {
      try {
        let currentAuth = isAuthenticated;
        let readyEmail = authenticatedEmail;
        let readyName = authenticatedName;

        if (!currentAuth) {
          try {
            const readiness = await checkHostAuthReadinessAction();
            if (readiness.isReady && readiness.user) {
              currentAuth = true;
              readyEmail = readiness.user.email || readyEmail;
              readyName = readiness.user.name || readyName;
            }
          } catch {}
        }

        if (!currentAuth) {
          setAutoSubmitIntent(true);
          toast.info("Sign in to submit your celebration. Your details are saved and will be restored automatically.");
          window.location.assign(`/login?redirect_url=${encodeURIComponent("/list-wedding?resume=true")}`);
          return;
        }

        const res = await submitHostApplicationAction({
          applicationId: applicationId || undefined,
          ...draft,
          hostName: draft.hostName || readyName,
          email: readyEmail,
          days: (draft.days || []).slice(0, draft.durationDays || 3),
        });
        if (res && res.success) {
          setHasAutoSubmitted(true);
          clearLocalWeddingDraft();
          setAutoSubmitIntent(false);
          setAppStatus("SUBMITTED");
          setVerificationStatus("PENDING");
          toast.success("Your celebration has been submitted for verification.");
          window.location.href = "/dashboard";
        } else {
          // On failure: preserve local draft in storage
          saveLocalWeddingDraft(draft);
          const errorMsg = res && !res.success ? res.error : "Submission failed. Your draft is still saved.";
          setAutoResumeError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (err: any) {
        console.error("[list-wedding] submitHostApplicationAction error:", err);
        saveLocalWeddingDraft(draft);
        const errorMsg = err?.message || "Submission failed. Your draft is still saved.";
        setAutoResumeError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    })();
  }, [buildLocalDraft, isAuthenticated, authenticatedEmail, authenticatedName, applicationId]);

  // AUTO-RESUME & SUBMIT HOOK: Triggers when returning from Clerk login/signup
  useEffect(() => {
    const resumeParam = searchParams?.get("resume") === "true";
    const autoIntent = hasAutoSubmitIntent();
    const shouldResume = resumeParam || autoIntent || isResuming;

    // Guard: Only proceed if in resume flow, not yet successfully submitted, and no resume execution is in-flight
    if (!shouldResume || hasAutoSubmitted || isAutoSubmittingRef.current) return;

    const draft = getLocalWeddingDraft();
    if (!draft || (!draft.coupleNames && !draft.brideName && !draft.hostName) || (!draft.city && !draft.venueName)) {
      return;
    }

    // Immediately restore form fields so the user sees their work
    populateFieldsFromDraft(draft);

    isAutoSubmittingRef.current = true;
    setIsSubmitting(true);
    setAutoResumeError(null);

    let isCancelled = false;

    (async () => {
      try {
        toast.loading("Verifying your session and submitting your celebration details...", { id: "resume-submit" });

        // 1. Deterministic Server-Side Auth Readiness Check with Backoff Retry
        let isAuthReady = false;
        let verifiedUser: any = null;
        const maxReadinessAttempts = 5;
        const baseDelayMs = 300;

        for (let attempt = 1; attempt <= maxReadinessAttempts; attempt++) {
          if (isCancelled) break;
          try {
            const readiness = await checkHostAuthReadinessAction();
            if (readiness.isReady && readiness.user) {
              isAuthReady = true;
              verifiedUser = readiness.user;
              break;
            }
          } catch (probeErr) {
            console.warn(`[list-wedding] Auth readiness probe attempt ${attempt} warning:`, probeErr);
          }

          if (attempt < maxReadinessAttempts) {
            const delay = baseDelayMs * Math.pow(1.5, attempt - 1);
            await new Promise((r) => setTimeout(r, delay));
          }
        }

        if (isCancelled) return;

        // If readiness check didn't confirm auth and client isn't ready, alert user to submit manually
        if (!isAuthReady && !user && (!clerkLoaded || !isSignedIn)) {
          toast.error("Your session is still initializing. Please click 'Submit Celebration' below.", {
            id: "resume-submit",
          });
          setAutoResumeError("Authentication session is initializing. Please click 'Submit Celebration' below to complete your listing.");
          saveLocalWeddingDraft(draft);
          isAutoSubmittingRef.current = false;
          setIsSubmitting(false);
          return;
        }

        // 2. Prepare payload from draft with authoritatively resolved details
        const resolvedCoupleNames =
          draft.coupleNames ||
          (draft.brideName && draft.groomName ? `${draft.brideName} & ${draft.groomName} Celebration` : draft.brideName || draft.hostName || "Our Celebration");
        const resolvedHostName = draft.hostName || verifiedUser?.name || authenticatedName || clerkUser?.fullName || clerkUser?.firstName || "Host";
        const resolvedEmail = verifiedUser?.email || authenticatedEmail || draft.email || clerkUser?.primaryEmailAddress?.emailAddress || "";
        const resolvedDate = draft.weddingDate || new Date().toISOString().split("T")[0];

        const payload: HostApplicationInput = {
          applicationId: applicationId || undefined,
          hostName: resolvedHostName,
          email: resolvedEmail,
          phone: draft.phone,
          preferredContactMethod: draft.preferredContactMethod || "WHATSAPP",
          brideName: draft.brideName,
          groomName: draft.groomName,
          coupleNames: resolvedCoupleNames,
          city: draft.city || "India",
          state: draft.state,
          venueName: draft.venueName,
          weddingDate: resolvedDate,
          durationDays: draft.durationDays || 3,
          tradition: draft.tradition || "Traditional / Cultural",
          weddingScale: draft.weddingScale || "MEDIUM",
          expectedTotalGuests: draft.expectedTotalGuests || 200,
          expectedInternationalGuests: draft.expectedInternationalGuests || 20,
          requestedTier: draft.requestedTier || "SIGNATURE_ROYAL",
          story: draft.story || "",
          days: (draft.days || []).slice(0, draft.durationDays || 3),
        };

        // 3. Attempt submission with transient retry loop (up to 3 attempts)
        let submissionResult: SubmitHostApplicationResult | null = null;
        const maxSubmissionAttempts = 3;

        for (let subAttempt = 1; subAttempt <= maxSubmissionAttempts; subAttempt++) {
          if (isCancelled) break;
          try {
            submissionResult = await submitHostApplicationAction(payload);
            if (submissionResult.success) {
              break;
            }
            // If error is transient, wait and retry
            const errCode = submissionResult.errorCode || "";
            const isTransient = errCode === "UNAUTHORIZED" || errCode === "SERVICE_UNAVAILABLE" || errCode === "AUTH_NOT_READY";
            if (isTransient && subAttempt < maxSubmissionAttempts) {
              await new Promise((r) => setTimeout(r, 600 * subAttempt));
              continue;
            }
            // Permanent failure or exhausted retries
            break;
          } catch (subErr: any) {
            console.warn(`[list-wedding] Submission attempt ${subAttempt} error:`, subErr);
            if (subAttempt < maxSubmissionAttempts) {
              await new Promise((r) => setTimeout(r, 600 * subAttempt));
            } else {
              submissionResult = {
                success: false,
                error: subErr?.message || "Submission failed.",
                errorCode: subErr?.code || "SUBMISSION_ERROR",
              };
            }
          }
        }

        if (isCancelled) return;

        if (submissionResult && submissionResult.success) {
          // Confirmed success: only now clear local draft and intent, and mark auto-submitted
          setHasAutoSubmitted(true);
          clearLocalWeddingDraft();
          setAutoSubmitIntent(false);
          setAppStatus("SUBMITTED");
          setVerificationStatus("PENDING");
          toast.success("Welcome! Your wedding details have been successfully submitted for verification.", {
            id: "resume-submit",
          });
          try {
            router.push("/dashboard");
          } catch {}
          window.location.href = "/dashboard";
        } else {
          // On failure: DO NOT mark hasAutoSubmitted, PRESERVE draft in localStorage
          const errorMsg = submissionResult && !submissionResult.success ? submissionResult.error : "Failed to auto-submit saved details. Please review and click Submit.";
          setAutoResumeError(errorMsg);
          toast.error(errorMsg, {
            id: "resume-submit",
          });
          saveLocalWeddingDraft(draft);
        }
      } catch (err: any) {
        console.error("[list-wedding] auto-resume unexpected error:", err);
        const errorMsg = err?.message || "Failed to auto-submit. Your draft is saved — please click Submit.";
        setAutoResumeError(errorMsg);
        toast.error(errorMsg, {
          id: "resume-submit",
        });
        saveLocalWeddingDraft(draft);
      } finally {
        isAutoSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [
    isAuthenticated,
    user,
    clerkLoaded,
    isSignedIn,
    clerkUser,
    authenticatedEmail,
    authenticatedName,
    isResuming,
    hasAutoSubmitted,
    applicationId,
    router,
    populateFieldsFromDraft,
    searchParams,
  ]);


  // Document Upload Handler for Post-Submission Action Required slots
  const handleDocumentUpload = async (requestId: string, file: File) => {
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size must be under 15MB.");
      return;
    }

    setIsUploadingDocId(requestId);
    try {
      const fakeUploadedUrl = `https://storage.weddingwithindia.com/docs/${requestId}-${encodeURIComponent(file.name)}`;

      await uploadHostRequestedDocumentAction({
        requestId,
        fileUrl: fakeUploadedUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      toast.success(`Uploaded '${file.name}' successfully!`);
      await fetchActiveApplication();
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploadingDocId(null);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-warm-50 pt-20 sm:pt-28 pb-28 pb-bottom-nav">
      <div className="container-luxury max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-maroon-100/60">
            <Sparkles size={13} className="text-amber-700" />
            Celebration Intake &amp; Revenue Planner
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-charcoal-900 leading-tight">
            List Your Celebration on <span className="text-gradient-brand">WeddingWithIndia</span>
          </h1>
          <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Tell us about your celebration. See your potential host earnings as you build it.
          </p>
        </div>

        {/* Persistence & Autosave Status Bar */}
        <div className="bg-white border border-warm-200/80 rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full",
                autosaveState === "saving"
                  ? "bg-amber-500 animate-pulse"
                  : autosaveState === "saved"
                  ? "bg-emerald-500"
                  : autosaveState === "error"
                  ? "bg-red-500"
                  : "bg-charcoal-300"
              )}
            />
            <span className="text-xs font-semibold text-charcoal-600">
              {isLoadingActiveApp
                ? "Loading active application from database..."
                : autosaveState === "saving"
                ? "Saving draft to server..."
                : autosaveState === "saved"
                ? `Draft saved to server ${lastSavedTime ? `at ${lastSavedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "just now"}`
                : autosaveState === "error"
                ? "Unable to autosave — click 'Save Draft' to retry"
                : applicationId
                ? "Resumed existing application from database"
                : "Autosave enabled — progress is saved automatically"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualSave}
              disabled={autosaveState === "saving"}
              className="px-3.5 py-1.5 bg-warm-100 hover:bg-warm-200 text-charcoal-800 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save size={13} />
              Save Draft
            </button>
          </div>
        </div>

        {/* Celebration Application Submitted Confirmation Banner */}
        {(appStatus === "SUBMITTED" || verificationStatus === "PENDING" || appStatus === "UNDER_REVIEW") && (
          <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 size={26} className="text-emerald-700" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[0.625rem] font-bold uppercase tracking-widest bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                    Application Submitted &amp; Under Verification
                  </span>
                  {applicationId && (
                    <span className="text-[0.6875rem] font-mono text-emerald-800 font-semibold">
                      App ID: #{applicationId.slice(-6).toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-xl text-charcoal-900">
                  Your Celebration is Being Verified
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Our team is reviewing your celebration details. Once verified, your celebration will be listed on WeddingWithIndia and open for bookings from verified international guests.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Required Banner (Post-Submission Document Requests from Admin) */}
        {(appStatus === "ACTION_REQUIRED" || verificationStatus === "NEED_MORE_DOCUMENTS" || documentRequests.length > 0) && (
          <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[0.625rem] font-bold uppercase tracking-widest bg-amber-200 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                    Action Required: Documents / Media Requested
                  </span>
                  {applicationId && (
                    <span className="text-[0.6875rem] font-mono text-amber-800 font-semibold">
                      App ID: #{applicationId.slice(-6).toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-xl text-charcoal-900">
                  Verification Team Requests
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Our verification team reviewed your celebration and requested the specific materials below. Please upload each requested item to complete your verification.
                </p>
              </div>
            </div>

            {adminNotes && (
              <div className="bg-white border border-amber-200 rounded-2xl p-4 text-xs space-y-1">
                <span className="font-bold text-amber-900 uppercase text-[0.625rem] tracking-wider block">
                  Admin Reviewer Notes:
                </span>
                <p className="text-charcoal-800 italic leading-relaxed">
                  &quot;{adminNotes}&quot;
                </p>
              </div>
            )}

            {documentRequests.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                  Requested Items:
                </h4>
                <div className="space-y-3">
                  {documentRequests.map((req: any) => {
                    const isFulfilled = req.status === "FULFILLED" || req.status === "APPROVED";
                    const isUploading = isUploadingDocId === req.id;

                    return (
                      <div
                        key={req.id}
                        className={cn(
                          "p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                          isFulfilled ? "bg-emerald-50/70 border-emerald-200" : "bg-white border-amber-200 shadow-2xs"
                        )}
                      >
                        <div className="space-y-1 max-w-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-charcoal-900">{req.title}</span>
                            {req.isRequired && (
                              <span className="text-[0.625rem] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                Required
                              </span>
                            )}
                            {isFulfilled && (
                              <span className="text-[0.625rem] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 size={11} /> Uploaded
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-charcoal-600 leading-snug">{req.description}</p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <label className="btn btn-secondary text-xs font-bold px-4 py-2 cursor-pointer inline-flex items-center gap-1.5">
                            {isUploading ? (
                              <RefreshCw size={13} className="animate-spin text-maroon-700" />
                            ) : (
                              <Upload size={13} />
                            )}
                            <span>{isFulfilled ? "Replace File" : "Upload Document"}</span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              disabled={isUploading}
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleDocumentUpload(req.id, f);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 
          ========================================================================
          UNIFIED TOP CARD: YOUR WEDDING & POTENTIAL EARNINGS
          All interactive financial & celebration planning controls live in ONE place.
          ========================================================================
        */}
        <div
          id="earnings-planner"
          className="bg-white border-2 border-warm-200/90 rounded-[2.5rem] p-6 sm:p-10 shadow-sm space-y-8 relative overflow-hidden"
        >
          {/* Header */}
          <div className="border-b border-warm-100 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-[var(--color-brand-primary)] block">
                Authoritative Host Planner
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
                Your Wedding &amp; Potential Earnings
              </h2>
            </div>
            <span className="text-[0.625rem] font-bold bg-maroon-50 text-[var(--color-brand-primary)] px-3 py-1 rounded-full border border-maroon-100">
              Updates Instantly
            </span>
          </div>

          {/* 2-Column Grid: Steps on Left, Psychological Result on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Controls Column (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* STEP 1: How long is your celebration? */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold text-charcoal-700">
                  <span className="uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={14} className="text-maroon-700" />
                    Step 1: How long is your celebration?
                  </span>
                  <span className="text-[var(--color-brand-primary)] font-extrabold">
                    {durationDays} {durationDays === 1 ? "Day" : "Days"}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {([1, 2, 3, 4, 5] as WeddingDurationDays[]).map((d) => {
                    const isSelected = durationDays === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleDurationChange(d)}
                        aria-pressed={isSelected}
                        className={cn(
                          "py-3 rounded-2xl text-center text-xs font-bold transition-all border cursor-pointer",
                          isSelected
                            ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)] shadow-sm"
                            : "bg-warm-50/60 text-charcoal-700 border-warm-200 hover:bg-warm-100 hover:border-warm-300"
                        )}
                      >
                        {d} {d === 1 ? "Day" : "Days"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: How many international guests could you welcome? */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center text-xs font-bold text-charcoal-700">
                  <span className="uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={14} className="text-maroon-700" />
                    Step 2: How many international guests could you welcome?
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleGuestCountChange(expectedInternationalGuests - 1)}
                      disabled={expectedInternationalGuests <= 1}
                      aria-label="Decrease guest count"
                      className="w-7 h-7 rounded-lg border border-warm-300 bg-white text-charcoal-700 hover:bg-warm-100 flex items-center justify-center font-bold text-xs disabled:opacity-40 cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>

                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={expectedInternationalGuests}
                      onChange={(e) => handleGuestCountChange(Number(e.target.value))}
                      aria-label="Unique international guest count"
                      className="w-14 h-7 text-center text-xs font-extrabold bg-white border border-warm-300 rounded-lg text-charcoal-900 focus:outline-none focus:border-maroon-600"
                    />

                    <button
                      type="button"
                      onClick={() => handleGuestCountChange(expectedInternationalGuests + 1)}
                      disabled={expectedInternationalGuests >= 100}
                      aria-label="Increase guest count"
                      className="w-7 h-7 rounded-lg border border-warm-300 bg-white text-charcoal-700 hover:bg-warm-100 flex items-center justify-center font-bold text-xs disabled:opacity-40 cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min={1}
                  max={50}
                  value={expectedInternationalGuests}
                  onChange={(e) => handleGuestCountChange(Number(e.target.value))}
                  aria-label="Expected unique international guests slider"
                  className="w-full accent-[var(--color-brand-primary)] cursor-pointer h-2 bg-warm-200 rounded-lg"
                />

                <div className="flex justify-between text-[0.6875rem] font-medium text-charcoal-400">
                  <span>1 Guest</span>
                  <span className="text-[var(--color-brand-primary)] font-bold">20 Guests (Popular benchmark)</span>
                  <span>50 Guests</span>
                </div>
                <p className="text-[0.6875rem] text-charcoal-500 leading-relaxed">
                  Expected unique international guests. This is the primary commercial input for host payouts.
                </p>
              </div>

              {/* STEP 3: Which experience best describes your celebration? */}
              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between items-center text-xs font-bold text-charcoal-700">
                  <span className="uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-700" />
                    Step 3: Which experience best describes your celebration?
                  </span>
                  <span className="text-[var(--color-brand-primary)] font-extrabold">
                    {TIER_DESCRIPTIONS[requestedTier].title}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(["STANDARD", "ENHANCED", "GRAND", "ROYAL", "SIGNATURE_ROYAL"] as WeddingTier[]).map((tierKey) => {
                    const isSelected = requestedTier === tierKey;
                    const tierInfo = TIER_DESCRIPTIONS[tierKey];
                    const hostRate = getHostPayoutPerGuestINR(tierKey, durationDays);

                    return (
                      <button
                        key={tierKey}
                        type="button"
                        onClick={() => setRequestedTier(tierKey)}
                        aria-pressed={isSelected}
                        className={cn(
                          "p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between gap-1.5 cursor-pointer",
                          isSelected
                            ? "bg-maroon-50 border-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]/20 shadow-xs"
                            : "bg-white border-warm-200 hover:border-warm-300 text-charcoal-700"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-charcoal-900">{tierInfo.title}</span>
                          {isSelected && <CheckCircle2 size={14} className="text-[var(--color-brand-primary)]" />}
                        </div>
                        <span className="text-[0.6875rem] text-charcoal-500 leading-snug line-clamp-2">
                          {tierInfo.subtitle}
                        </span>
                        <div className="pt-1.5 border-t border-warm-100 flex items-center justify-between text-[0.625rem]">
                          <span className="text-charcoal-400 uppercase font-semibold">Fixed Rate:</span>
                          <span className="font-bold text-charcoal-900">
                            ₹{hostRate.toLocaleString("en-IN")}/guest
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[0.6875rem] text-charcoal-400 italic">
                  Your selection helps us understand your celebration. WeddingWithIndia will manually verify the final experience tier before your wedding goes live.
                </p>
              </div>
            </div>

            {/* Psychological Result Panel Column (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-warm-100/90 via-warm-50 to-amber-50/40 border border-warm-200 p-6 sm:p-7 rounded-3xl text-center space-y-5 shadow-xs sticky top-28">
              <div className="space-y-1">
                <span className="text-[0.6875rem] font-bold text-charcoal-500 uppercase tracking-widest block">
                  Estimated Potential Host Payout
                </span>

                {/* Big Psychological Lakh Headline */}
                <div className="font-display font-black text-4xl sm:text-5xl text-[var(--color-brand-primary)] tracking-tight">
                  {psychologicalHeadline}
                </div>

                {/* Exact Unrounded INR */}
                <div className="text-sm sm:text-base font-bold text-charcoal-800">
                  ₹{potentialHostTotalINR.toLocaleString("en-IN")}{" "}
                  <span className="text-xs font-medium text-charcoal-500">exact</span>
                </div>
              </div>

              {/* Transparent Calculation Pill */}
              <div className="p-4 bg-white/95 backdrop-blur-xs rounded-2xl border border-warm-200/80 text-xs text-charcoal-700 space-y-1.5 shadow-2xs">
                <div className="font-bold text-charcoal-900">
                  <span className="text-[var(--color-brand-primary)] font-black">
                    {expectedInternationalGuests} unique international {expectedInternationalGuests === 1 ? "guest" : "guests"}
                  </span>{" "}
                  × ₹{fixedPayoutPerGuestINR.toLocaleString("en-IN")} fixed payout per guest
                </div>
                <div className="text-[0.6875rem] text-charcoal-500">
                  {TIER_DESCRIPTIONS[requestedTier].title} Tier • {durationDays}-Day Celebration
                </div>
              </div>

              <p className="text-[0.6875rem] text-charcoal-500 max-w-sm mx-auto leading-relaxed">
                Estimated potential earnings based on your current plan. Final classification and eligible guest count are confirmed during WeddingWithIndia&apos;s verification process.
              </p>

              {/* Expandable Calculation Breakdown Drawer */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowCalculationDrawer(!showCalculationDrawer)}
                  className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline inline-flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <span>{showCalculationDrawer ? "Hide calculation breakdown" : "See how this is calculated"}</span>
                  {showCalculationDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showCalculationDrawer && (
                  <div className="text-left text-xs bg-white p-4.5 rounded-2xl border border-warm-200 space-y-3 mt-3 animate-fade-in shadow-xs">
                    <h4 className="font-bold text-xs text-charcoal-900 uppercase tracking-wider border-b border-warm-100 pb-1.5">
                      Calculation Breakdown
                    </h4>

                    <div className="space-y-1.5 text-[0.6875rem]">
                      <div className="flex justify-between py-1 border-b border-warm-50">
                        <span className="text-charcoal-500">Selected Tier:</span>
                        <span className="font-bold text-charcoal-800">{WEDDING_TIER_CONFIG[requestedTier].label}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-warm-50">
                        <span className="text-charcoal-500">Duration:</span>
                        <span className="font-bold text-charcoal-800">{durationDays} {durationDays === 1 ? "Day" : "Days"}</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-warm-50">
                        <span className="text-charcoal-500">Unique Expected Guests:</span>
                        <span className="font-bold text-charcoal-800">{expectedInternationalGuests} guests</span>
                      </div>

                      <div className="flex justify-between py-1 border-b border-warm-50">
                        <span className="text-charcoal-500">Fixed Host Payout Rate:</span>
                        <span className="font-bold text-charcoal-900">
                          ₹{fixedPayoutPerGuestINR.toLocaleString("en-IN")} / guest
                        </span>
                      </div>

                      <div className="flex justify-between py-1.5 font-bold text-charcoal-900 border-b border-warm-100">
                        <span>Total Estimated Potential Payout:</span>
                        <span className="text-[var(--color-brand-primary)]">
                          ₹{potentialHostTotalINR.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Informational Daily Equivalents */}
                      <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/70 space-y-1 mt-2">
                        <span className="font-bold text-[0.625rem] text-amber-900 uppercase tracking-wide block">
                          Informational Daily Equivalents:
                        </span>
                        <div className="flex justify-between text-amber-800 text-[0.625rem]">
                          <span>Average host payout per day:</span>
                          <span className="font-semibold">
                            ₹{averageDailyHostEquivalentINR} / guest / day
                          </span>
                        </div>
                        <div className="flex justify-between text-amber-800 text-[0.625rem]">
                          <span>Average customer package value:</span>
                          <span className="font-semibold">
                            ${averageDailyCustomerEquivalentUSD} / guest / day (${customerPriceUSD} total)
                          </span>
                        </div>
                        <p className="text-[0.5625rem] text-amber-700 italic pt-0.5">
                          * Informational only. Payouts are governed by the authoritative whole-package rate, not daily multipliers.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 
          ========================================================================
          MAIN APPLICATION FORM (Host Details, Wedding Overview, Day-by-Day, Story)
          ========================================================================
        */}
        {/* Mobile-only: sticky step progress bar */}
        <div className="sticky top-[4.25rem] z-30 -mx-4 px-4 py-2 bg-warm-50/95 backdrop-blur-sm border-b border-warm-100 sm:hidden">
          <div className="flex items-center gap-1">
            {[
              { n: 1, label: "Host" },
              { n: 2, label: "Overview" },
              { n: 3, label: "Schedule" },
              { n: 4, label: "Story" },
            ].map(({ n, label }) => (
              <a
                key={n}
                href={`#step-${n}`}
                className="flex-1 flex flex-col items-center gap-0.5 group"
              >
                <span className="w-6 h-6 rounded-full bg-maroon-50 border border-maroon-200 text-[var(--color-brand-primary)] text-[0.625rem] font-black flex items-center justify-center group-hover:bg-maroon-100 transition-colors">
                  {n}
                </span>
                <span className="text-[0.5rem] font-bold text-charcoal-400 uppercase tracking-wide">{label}</span>
              </a>
            ))}
          </div>
        </div>

        <form id="host-application-form" noValidate onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: Host & Contact Details */}
          <div id="step-1" className="bg-white border border-warm-200/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
            <div className="border-b border-warm-100 pb-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-black flex items-center justify-center border border-maroon-200">
                  1
                </span>
                Host &amp; Contact Details
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Tell us who is coordinating this celebration for visiting international guests.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  Host / Coordinator Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hostName"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. Rajesh Mehra"
                  className="w-full px-4 py-3 bg-warm-50/50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={email || user?.email || ""}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-warm-50/50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-warm-50/50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["WHATSAPP", "PHONE", "EMAIL"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPreferredContactMethod(method)}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                        preferredContactMethod === method
                          ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]"
                          : "bg-warm-50/50 text-charcoal-700 border-warm-200 hover:bg-warm-100"
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  Bride&apos;s Name
                </label>
                <input
                  type="text"
                  name="brideName"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  placeholder="e.g. Ananya"
                  className="w-full px-4 py-3 bg-warm-50/50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  Groom&apos;s Name
                </label>
                <input
                  type="text"
                  name="groomName"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  placeholder="e.g. Kabir"
                  className="w-full px-4 py-3 bg-warm-50/50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  Couple Celebration Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="coupleNames"
                  required
                  value={coupleNames}
                  onChange={(e) => setCoupleNames(e.target.value)}
                  placeholder="e.g. Ananya & Kabir Celebration"
                  className="w-full px-4 py-3 bg-warm-50/50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Wedding Overview & Location (No duplicate controls!) */}
          <div id="step-2" className="bg-white border border-warm-200/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
            <div className="border-b border-warm-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-black flex items-center justify-center border border-maroon-200">
                    2
                  </span>
                  Wedding Overview &amp; Location
                </h2>
                <p className="text-xs text-charcoal-500 mt-1">
                  Tell us where your celebration is taking place and its cultural background.
                </p>
              </div>

              {/* Read-only summary chip pointing to unified planner */}
              <a
                href="#earnings-planner"
                className="inline-flex items-center gap-1.5 text-[0.6875rem] font-bold text-[var(--color-brand-primary)] bg-maroon-50/80 hover:bg-maroon-100/80 px-3 py-1.5 rounded-xl border border-maroon-100 transition-colors shrink-0"
              >
                <CheckCircle2 size={12} />
                <span>{durationDays}d · {expectedInternationalGuests} guests · {TIER_DESCRIPTIONS[requestedTier].title}</span>
                <ArrowUp size={11} />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Udaipur"
                  className="w-full px-4 py-3 bg-warm-50/50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  State / Region
                </label>
                <input
                  type="text"
                  name="state"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Rajasthan"
                  className="w-full px-4 py-3 bg-warm-50/50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  Primary Venue Name / Type
                </label>
                <input
                  type="text"
                  name="venueName"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Heritage Resort / City Lawn"
                  className="w-full px-4 py-3 bg-warm-50/50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  Wedding Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="weddingDate"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full px-4 py-3 bg-warm-50/50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all"
                />
              </div>

              {/* Tradition / Cultural Style (Neutral by default) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  Tradition / Cultural Style <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={tradition || "Traditional / Cultural"}
                  onChange={(e) => setTradition(e.target.value)}
                  className="w-full px-4 py-3 bg-warm-50/50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all"
                >
                  {TRADITION_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  Expected Total Wedding Guests (All)
                </label>
                <input
                  type="number"
                  min={20}
                  max={10000}
                  value={expectedTotalGuests}
                  onChange={(e) => setExpectedTotalGuests(Number(e.target.value))}
                  placeholder="250"
                  className="w-full px-4 py-3 bg-warm-50/50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all"
                />
              </div>

              {/* Free-text input when "Other" tradition is selected */}
              {tradition === "Other" && (
                <div className="sm:col-span-2 space-y-1.5 animate-fade-in">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                    Please describe your celebration tradition / culture <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customTradition}
                    onChange={(e) => setCustomTradition(e.target.value)}
                    placeholder="e.g. Konkani Christian, Parsi, Regional Folk, etc."
                    className="w-full px-4 py-3 bg-warm-50/50 border border-warm-200 rounded-xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all"
                  />
                </div>
              )}

              {/* Wedding Scale Selector */}
              <div className="sm:col-span-2 space-y-2 pt-1">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                  Celebration Scale
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {SCALES.map((scale) => {
                    const isSelected = weddingScale === scale.key;
                    return (
                      <button
                        key={scale.key}
                        type="button"
                        onClick={() => setWeddingScale(scale.key as any)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1",
                          isSelected
                            ? "bg-maroon-50 border-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]/20 shadow-xs"
                            : "bg-warm-50/50 border-warm-200 hover:bg-warm-100"
                        )}
                      >
                        <span className="font-bold text-xs text-charcoal-900">{scale.label}</span>
                        <span className="text-[0.625rem] text-charcoal-500 leading-tight">{scale.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div id="step-3" className="bg-white border border-warm-200/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
            <div className="border-b border-warm-100 pb-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-black flex items-center justify-center border border-maroon-200">
                  3
                </span>
                Day-by-Day Celebration Details ({durationDays} {durationDays === 1 ? "Day" : "Days"})
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Describe the schedule, culinary experiences, and dress guidance for each day. Add any ceremonies or activities that happen on each day.
              </p>
            </div>

            {/* Day Accordion */}
            <div className="space-y-4">
              {activeDays.map((day, dIdx) => {
                const isExpanded = expandedDay === day.dayNumber;
                const eventCount = day.events?.length || 0;

                return (
                  <div
                    key={day.dayNumber}
                    className="border border-warm-200 rounded-2xl overflow-hidden transition-all shadow-2xs"
                  >
                    {/* Day Accordion Header */}
                    <button
                      type="button"
                      onClick={() => setExpandedDay(isExpanded ? 0 : day.dayNumber)}
                      className={cn(
                        "w-full px-5 py-4 flex items-center justify-between text-left transition-all cursor-pointer",
                        isExpanded ? "bg-maroon-50/70 border-b border-warm-200" : "bg-white hover:bg-warm-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary)] text-white text-xs font-black flex items-center justify-center">
                          D{day.dayNumber}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-charcoal-900 block">
                            {day.title || `Day ${day.dayNumber}`}
                          </span>
                          <span className="text-[0.6875rem] text-charcoal-500">
                            {eventCount === 0 ? "No ceremonies or events added yet" : `${eventCount} ${eventCount === 1 ? "event" : "events"} planned`} · {day.expectedInternationalGuests || expectedInternationalGuests} guests expected
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[0.625rem] font-bold bg-white text-charcoal-700 px-2.5 py-1 rounded-full border border-warm-200">
                          {isExpanded ? "Collapse" : "Edit Day Details"}
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {/* Day Form Body */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 bg-warm-50/30 space-y-5 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-charcoal-700">
                              Day Title / Theme
                            </label>
                            <input
                              type="text"
                              value={day.title}
                              onChange={(e) => handleUpdateDay(dIdx, "title", e.target.value)}
                              placeholder={`e.g. Day ${day.dayNumber} Celebration`}
                              className="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-xs text-charcoal-900"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-charcoal-700">
                              Day Date
                            </label>
                            <input
                              type="date"
                              value={day.date}
                              onChange={(e) => handleUpdateDay(dIdx, "date", e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-xs text-charcoal-900"
                            />
                          </div>
                        </div>

                        {/* Ceremonies & Events Dynamic List (Neutral by default) */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                              Events &amp; Ceremonies for Day {day.dayNumber}:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddEvent(dIdx)}
                              className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={13} /> Add ceremony or event
                            </button>
                          </div>

                          {(!day.events || day.events.length === 0) ? (
                            <div className="bg-white p-5 rounded-xl border border-dashed border-warm-300 text-center space-y-2">
                              <p className="text-xs text-charcoal-500 font-medium">
                                No ceremonies or events added for Day {day.dayNumber} yet.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleAddEvent(dIdx)}
                                className="text-xs font-bold text-[var(--color-brand-primary)] bg-maroon-50 hover:bg-maroon-100 px-3.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={13} /> Add ceremony or event
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {day.events.map((ev, eIdx) => (
                                <div
                                  key={eIdx}
                                  className="bg-white p-3.5 rounded-xl border border-warm-200/90 shadow-2xs space-y-2"
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                    <div className="sm:col-span-5">
                                      <input
                                        type="text"
                                        required
                                        value={ev.name}
                                        onChange={(e) => handleUpdateEvent(dIdx, eIdx, "name", e.target.value)}
                                        placeholder="Event / ceremony name (e.g. Family Welcome Dinner) *"
                                        className="w-full px-3 py-2 bg-warm-50/50 border border-warm-200 rounded-lg text-xs text-charcoal-900 font-semibold"
                                      />
                                    </div>

                                    <div className="sm:col-span-2">
                                      <input
                                        type="text"
                                        value={ev.startTime}
                                        onChange={(e) => handleUpdateEvent(dIdx, eIdx, "startTime", e.target.value)}
                                        placeholder="Start (17:00)"
                                        className="w-full px-2.5 py-2 bg-warm-50/50 border border-warm-200 rounded-lg text-xs text-charcoal-900 font-mono"
                                      />
                                    </div>

                                    <div className="sm:col-span-2">
                                      <input
                                        type="text"
                                        value={ev.endTime}
                                        onChange={(e) => handleUpdateEvent(dIdx, eIdx, "endTime", e.target.value)}
                                        placeholder="End (21:00)"
                                        className="w-full px-2.5 py-2 bg-warm-50/50 border border-warm-200 rounded-lg text-xs text-charcoal-900 font-mono"
                                      />
                                    </div>

                                    <div className="sm:col-span-2">
                                      <input
                                        type="text"
                                        value={ev.location || ""}
                                        onChange={(e) => handleUpdateEvent(dIdx, eIdx, "location", e.target.value)}
                                        placeholder="Location"
                                        className="w-full px-2.5 py-2 bg-warm-50/50 border border-warm-200 rounded-lg text-xs text-charcoal-900"
                                      />
                                    </div>

                                    <div className="sm:col-span-1 text-right">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveEvent(dIdx, eIdx)}
                                        className="p-2 text-charcoal-400 hover:text-red-600 cursor-pointer"
                                        title="Remove ceremony or event"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>

                                  <input
                                    type="text"
                                    value={ev.description || ""}
                                    onChange={(e) => handleUpdateEvent(dIdx, eIdx, "description", e.target.value)}
                                    placeholder="Tell us what happens and what visiting guests can experience."
                                    className="w-full px-3 py-1.5 bg-warm-50/30 border border-warm-100 rounded-lg text-[0.6875rem] text-charcoal-700"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Experiential Optional Details for this Day */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-warm-200/60">
                          <div className="space-y-1">
                            <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase">
                              Guest Cultural Experience (Optional)
                            </label>
                            <input
                              type="text"
                              value={day.guestExperience || ""}
                              onChange={(e) => handleUpdateDay(dIdx, "guestExperience", e.target.value)}
                              placeholder="e.g. Welcome drinks, traditional music, interactive dance"
                              className="w-full px-3 py-2 bg-white border border-warm-200 rounded-xl text-xs text-charcoal-900"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase">
                              Food &amp; Meal Experience (Optional)
                            </label>
                            <input
                              type="text"
                              value={day.foodExperience || ""}
                              onChange={(e) => handleUpdateDay(dIdx, "foodExperience", e.target.value)}
                              placeholder="e.g. Traditional feast, live dessert counters"
                              className="w-full px-3 py-2 bg-white border border-warm-200 rounded-xl text-xs text-charcoal-900"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase">
                              Recommended Attire &amp; Guidance (Optional)
                            </label>
                            <input
                              type="text"
                              value={day.dressCode || ""}
                              onChange={(e) => handleUpdateDay(dIdx, "dressCode", e.target.value)}
                              placeholder="e.g. Smart festive wear or formal attire"
                              className="w-full px-3 py-2 bg-white border border-warm-200 rounded-xl text-xs text-charcoal-900"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase">
                              Special Activities &amp; Highlights (Optional)
                            </label>
                            <input
                              type="text"
                              value={day.specialActivities || ""}
                              onChange={(e) => handleUpdateDay(dIdx, "specialActivities", e.target.value)}
                              placeholder="e.g. Procession, live music, floral welcome"
                              className="w-full px-3 py-2 bg-white border border-warm-200 rounded-xl text-xs text-charcoal-900"
                            />
                          </div>
                        </div>

                        {/* Day Attendance Note */}
                        <div className="bg-warm-100/60 p-3 rounded-xl flex items-start gap-2 text-[0.6875rem] text-charcoal-600">
                          <Info size={14} className="text-maroon-700 shrink-0 mt-0.5" />
                          <span>
                            This describes attendance by day ({day.expectedInternationalGuests || expectedInternationalGuests} guests). Your potential payout is calculated using unique eligible international guests from the earnings planner above.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: Couple Story & Vision */}
          <div id="step-4" className="bg-white border border-warm-200/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-black flex items-center justify-center border border-maroon-200">
                4
              </span>
              Celebration Story &amp; Hospitality Message
            </h2>
            <p className="text-xs text-charcoal-500">
              Share a short message to international travelers about your celebration and what they will experience.
            </p>
            <textarea
              name="story"
              rows={4}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="e.g. We are excited to welcome travelers from around the world to experience the warmth, music, and sacred traditions of our celebration..."
              className="w-full p-4 bg-warm-50/50 border border-warm-200 rounded-2xl text-xs text-charcoal-900 font-medium focus:bg-white focus:outline-none focus:border-maroon-600 transition-all leading-relaxed"
            />
          </div>

          {/* Submission Notice / Auto-Resume Error Banner */}
          {autoResumeError && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-4 flex items-start gap-3 text-xs shadow-2xs">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Submission Update</p>
                <p className="text-amber-800">{autoResumeError}</p>
              </div>
            </div>
          )}

          {/* Form Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={handleManualSave}
              disabled={autosaveState === "saving" || isSubmitting}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-warm-200 text-charcoal-800 rounded-2xl text-xs font-bold hover:bg-warm-50 transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
            >
              <Save size={15} />
              Save &amp; Continue Later
            </button>

            <div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 bg-[var(--color-brand-primary)] text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-maroon-900 transition-all shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Submit Celebration for Verification
                  </>
                )}
              </button>
              <span className="text-[0.6875rem] text-charcoal-500 italic">
                No photos or documents are required right now. Our verification team will review your celebration and request specific materials if needed.
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ListWeddingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-warm-50 pt-20 sm:pt-28 pb-20 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-800 animate-spin mx-auto" />
            <p className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">
              Loading celebration intake form...
            </p>
          </div>
        </div>
      }
    >
      <ListWeddingContent />
    </Suspense>
  );
}

/**
 * lib/constants/legal.ts
 *
 * Single Source of Truth for WeddingWithIndia Legal, Trust, Safety,
 * Compliance, Grievance, and Regulatory Configuration.
 *
 * Implements disclosures compliant with:
 * - Consumer Protection Act, 2019 & E-Commerce Rules, 2020 (India)
 * - Guidelines for Prevention of Misleading Advertisements, 2022 & Dark Patterns, 2023 (India)
 * - Digital Personal Data Protection Act, 2023 & DPDP Rules (India)
 * - Information Technology (Intermediary Guidelines) Rules, 2021 (India)
 * - EU & UK GDPR / Data Protection Act 2018
 * - US FTC Act (Truth in Advertising, Endorsements, Testimonials)
 * - Australian Privacy Principles & Australian Consumer Law
 */

export const LEGAL_CONFIG = {
  // Platform & Entity Identification
  PLATFORM_NAME: "WeddingWithIndia",
  BRAND_NAME: "Wedding With India",
  PLATFORM_ROLE: "Technology Marketplace Intermediary & Cultural Experience Facilitator",
  OPERATING_COUNTRY: "India",
  OPERATING_REGION: "Jaipur, Rajasthan, India",
  PRIMARY_DOMAIN: "weddingwithindia.com",
  PRIMARY_SUPPORT_EMAIL: "contact@weddingwithindia.com",
  CONCIERGE_EMAIL: "concierge@weddingwithindia.com",
  SAFETY_EMAIL: "safety@weddingwithindia.com",
  PRESS_EMAIL: "press@weddingwithindia.com",
  SUPPORT_PHONE: "+91 91 1673 4675",

  // Business Structure & Intermediary Disclosure
  INTERMEDIARY_DISCLOSURE:
    "Wedding With India is an online technology platform and marketplace intermediary that connects international travelers with participating Indian host families celebrating weddings, independent local cultural coordinators, and service partners. Wedding With India does not organize, direct, own, or operate individual wedding ceremonies or private family venues. Primary responsibility for event hospitality, ceremony execution, and local arrangements rests with the respective participating host families and independent service providers.",

  // Statutory Grievance Redressal Mechanism (MeitY IT Intermediary Rules 2021 & E-Commerce Rules 2020)
  GRIEVANCE_OFFICER: {
    NAME: "Grievance Officer",
    DEPARTMENT: "Trust, Safety & Grievance Redressal Cell",
    ORGANIZATION: "WeddingWithIndia",
    ADDRESS: "C-Scheme / Civil Lines, Jaipur, Rajasthan 302001, India",
    EMAIL: "grievance@weddingwithindia.com",
    ACKNOWLEDGMENT_TIMEFRAME_HOURS: 24, // As mandated by IT Rules 2021
    RESOLUTION_TIMEFRAME_DAYS: 15, // As mandated by IT Rules 2021
  },

  // Privacy & Data Protection Contact (DPDP Act 2023 & GDPR)
  DATA_PROTECTION: {
    CONTACT_NAME: "Data Protection & Privacy Lead",
    EMAIL: "privacy@weddingwithindia.com",
    DPO_EMAIL: "dpo@weddingwithindia.com",
    DPDP_NODAL_EMAIL: "dpdp@weddingwithindia.com",
    EU_PRIVACY_EMAIL: "privacy@weddingwithindia.com",
  },

  // Emergency & Official Tourist Helplines in India (Public Official Sources)
  EMERGENCY_HELPLINES_INDIA: {
    NATIONAL_EMERGENCY: "112",
    POLICE: "100 / 112",
    AMBULANCE: "108 / 102",
    FIRE: "101",
    TOURIST_HELPLINE_24X7: "1363", // Ministry of Tourism, Govt. of India (Toll-Free, Multi-lingual)
    TOURIST_HELPLINE_ALT: "+91 11 2336 5358",
    WOMEN_HELPLINE: "1091 / 181",
  },

  // Official Visa & Travel Information Portal (Govt. of India)
  OFFICIAL_VISA_PORTAL_URL: "https://indianvisaonline.gov.in/evisa/tvoa.html",
  OFFICIAL_TOURISM_PORTAL_URL: "https://www.incredibleindia.gov.in",

  // Harmonized Cancellation & Refund Rules
  CANCELLATION_POLICY: {
    TIERS: [
      {
        TIMEFRAME: "More than 30 days before event date",
        REFUND_PERCENT: 85,
        NOTE: "85% refund (15% platform administrative, payment processing & host reservation hold fee retained)",
      },
      {
        TIMEFRAME: "15 to 30 days before event date",
        REFUND_PERCENT: 50,
        NOTE: "50% refund (50% retained due to locked host preparations, attire reservations & coordinator allocation)",
      },
      {
        TIMEFRAME: "Less than 15 days before event date",
        REFUND_PERCENT: 0,
        NOTE: "Non-refundable (host preparations, catering reservations and coordinator arrangements are finalized)",
      },
    ],
    HOST_CANCELLATION_REFUND_PERCENT: 100, // 100% full refund if host cancels or wedding is called off
    SAFETY_CASE_REFUND_NOTE: "Eligible for up to 100% refund upon verified safety case investigation by Trust & Safety",
  },

  // Photography & Media Consent Principles
  MEDIA_CONSENT: {
    ALLOWED_USE: "Personal, non-commercial, private memories on personal social media with respectful tagging.",
    PROHIBITED_USE:
      "Commercial monetization, unauthorized stock photography, unauthorized livestreaming of private rituals, harassment, or commercial advertising without explicit prior written consent from the host family.",
    SACRED_RITUAL_RULE:
      "Guests must respect photography restrictions during solemn religious moments as indicated by the host family or coordinator.",
    TAKEDOWN_EMAIL: "privacy@weddingwithindia.com",
  },

  // Non-Excludable Statutory Consumer Guarantees
  STATUTORY_GUARANTEE_STATEMENT:
    "Nothing in the Wedding With India Terms of Service, Traveler Agreement, or policies excludes, restricts, or modifies any statutory consumer guarantee, non-excludable warranty, or statutory remedy available under applicable consumer protection legislation, including the Consumer Protection Act, 2019 (India), the Australian Consumer Law, or mandatory provisions of EU/UK consumer protection laws.",
} as const;

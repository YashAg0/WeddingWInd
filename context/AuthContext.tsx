"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { UserRole as PrismaUserRole } from "@prisma/client";
import {
  syncAndGetDbUser,
  fetchDashboardDataAction,
  updateUserRoleAction,
  completeOnboardingAction,
  updateProfileDetails,
  toggleWishlistAction,
  createBookingAction,
  cancelBookingAction,
  handleGuestApplicationAction,
  markNotificationsReadAction,
  createCheckoutSessionAction,
  refundBookingAction,
  submitVerificationAction,
  reviewVerificationAction
} from "@/lib/actions";
import { validateDeviceSessionAction, revokeDeviceSessionAction } from "@/lib/actions/device-session";
import { DeviceSessionDTO } from "@/lib/services/device-session";
import { getOrCreateClientDeviceId, getClientDeviceName } from "@/lib/device-client";
import {
  getCachedUser,
  setCachedUser,
  clearCachedUser,
  getCachedDashboardData,
  setCachedDashboardData,
  clearCachedDashboardData,
  hasClerkSessionCookie,
} from "@/lib/client-cache";

export type UserRole = "traveler" | "couple" | "agent" | "admin" | "coordinator";

export type AuthState =
  | "INITIALIZING"
  | "AUTHENTICATING"
  | "READY"
  | "TEMPORARY_CONNECTION_FAILURE"
  | "DEVICE_LIMIT_REACHED"
  | "SESSION_REVOKED"
  | "FORBIDDEN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | null;
  onboarded: boolean;
  avatar: string;
  country?: string;
  bio?: string;
  phone?: string;
  // Traveler-specific
  language?: string;
  budget?: string;
  preferences?: string;
  foodPreferences?: string;
  accessibility?: string;
  // Host-specific
  weddingLocation?: string;
  traditions?: string;
  languagesSpoken?: string;
  expectedGuests?: number;
  photographyRules?: string;
  // Agent-specific
  organization?: string;
  experienceYears?: number;
  targetAudience?: string;
}

export interface Booking {
  id: string;
  weddingId: string;
  weddingTitle: string;
  location: string;
  imageUrl: string;
  date: string;
  pricePerGuest: number;
  guestsCount: number;
  attendanceSide?: "BRIDE_SIDE" | "GROOM_SIDE" | "OPEN";
  status: "upcoming" | "pending" | "rejected" | "cancelled" | "past" | "awaiting_payment" | "approved" | "refunded";
  payments?: any[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "request" | "alert" | "success";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  dataLoading: boolean;
  dataError: string | null;
  dbOffline: boolean;
  authState: AuthState;
  activeDeviceSessions: DeviceSessionDTO[];
  bookings: Booking[];
  wishlist: string[];
  notifications: Notification[];
  guestApplications: any[];
  hostWedding: any;
  coupleStats: any;
  adminStats: any;
  verification: any;
  login: (email?: string, name?: string) => void;
  signup: (email?: string, name?: string) => void;
  logout: () => void;
  updateRole: (role: UserRole) => void;
  completeOnboarding: (onboardingData: any, redirectUrl?: string) => void;
  updateProfile: (profileData: Partial<User>) => void;
  toggleWishlist: (weddingId: string) => void;
  addBooking: (booking: Omit<Booking, "id">) => void;
  cancelBooking: (bookingId: string) => void;
  markNotificationsRead: () => void;
  handleGuestApplication: (appId: string, status: "approved" | "rejected") => void;
  checkoutBooking: (bookingId: string) => Promise<string | null>;
  refundBooking: (bookingId: string) => Promise<void>;
  submitVerification: (data: any) => Promise<void>;
  reviewVerification: (verificationId: string, status: "APPROVED" | "REJECTED" | "UNDER_REVIEW", notes?: string) => Promise<void>;
  refreshData: (silent?: boolean) => Promise<void>;
  revokeDeviceSession: (sessionId: string) => Promise<void>;
  retryConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  // Instant client-side hydration from localStorage (0ms display)
  const [user, setUser] = useState<User | null>(() => getCachedUser());
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const dash = getCachedDashboardData();
    return dash?.wishlist || [];
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const dash = getCachedDashboardData();
    return dash?.notifications || [];
  });

  // Fast resolution: If user is cached, loading is immediately false.
  // If no user and no Clerk cookie exists, guest visitor loading is immediately false.
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const cached = getCachedUser();
      if (cached) return false;
      if (!hasClerkSessionCookie()) return false;
    }
    return true;
  });

  const [dbOffline, setDbOffline] = useState(false);
  const [authState, setAuthState] = useState<AuthState>(() => (getCachedUser() ? "READY" : "INITIALIZING"));
  const [dataLoading, setDataLoading] = useState<boolean>(() => !getCachedDashboardData());
  const [dataError, setDataError] = useState<string | null>(null);
  const [activeDeviceSessions, setActiveDeviceSessions] = useState<DeviceSessionDTO[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guestApplications, setGuestApplications] = useState<any[]>([]);
  const [hostWedding, setHostWedding] = useState<any>(null);
  const [coupleStats, setCoupleStats] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);

  const lastRefreshTimeRef = React.useRef<number>(0);

  // Function to refresh state data from Postgres and validate multi-device session.
  // Stale-While-Revalidate: If silent is true or user already exists, don't flip loading=true.
  const refreshData = useCallback(async (silent = false) => {
    const hasExistingUser = Boolean(user || getCachedUser());
    if (!hasExistingUser && !silent) {
      setLoading(true);
      setAuthState("AUTHENTICATING");
    }

    lastRefreshTimeRef.current = Date.now();

    try {
      let dbUser = await syncAndGetDbUser().catch(() => null);

      if (!dbUser && typeof document !== "undefined") {
        // Fallback for E2E testing environment
        try {
          const cookieMatch = document.cookie.match(/__wwi_e2e_session=([^;]+)/);
          if (cookieMatch) {
            const rawToken = decodeURIComponent(cookieMatch[1]);
            const parts = rawToken.split(".");
            if (parts.length === 2) {
              const b64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
              const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
              const payload = JSON.parse(atob(padded));
              if (payload.userId) {
                dbUser = {
                  id: payload.userId,
                  email: payload.email || `${payload.userId}@example.com`,
                  name: payload.name || payload.email?.split("@")[0] || "Test User",
                  role: payload.role || "TRAVELER",
                  status: "ACTIVE",
                } as any;
              }
            }
          }
        } catch (e) {
          console.warn("[AuthContext] E2E token decode fallback warning:", e);
        }
      }

      if (!dbUser) {
        if (isSignedIn) {
          // Clerk is signed in but DB sync returned null
          setDbOffline(true);
          setAuthState("TEMPORARY_CONNECTION_FAILURE");
        } else {
          // Unauthenticated session
          setUser(null);
          clearCachedUser();
          clearCachedDashboardData();
          setDbOffline(false);
          setAuthState("INITIALIZING");
        }
        setLoading(false);
        setDataLoading(false);
        return;
      }

      // DB is available and returned user record
      const isCoupleWithData = dbUser.role === "COUPLE" && (
        !!dbUser.coupleProfile || 
        ((dbUser.coupleProfile as any)?.weddings && (dbUser.coupleProfile as any).weddings.length > 0) || 
        !!(dbUser as any).verification
      );
      const isAgentWithData = dbUser.role === "AGENT" && !!dbUser.agentProfile;
      const isTravelerWithData = dbUser.role === "TRAVELER" && dbUser.status === "ACTIVE";
      const isAdminOrCoordinator = dbUser.role === "ADMIN" || dbUser.role === "COORDINATOR";
      const isOnboarded = dbUser.status === "ACTIVE" || isAdminOrCoordinator || isCoupleWithData || isAgentWithData || isTravelerWithData;
      const roleStr = dbUser.role.toLowerCase() as UserRole;

      const loadedUser: User = {
        id: dbUser.id,
        name: dbUser.name || dbUser.email.split("@")[0],
        email: dbUser.email,
        role: roleStr,
        onboarded: isOnboarded,
        avatar: dbUser.avatar || "",
        country: dbUser.travelerProfile?.country || dbUser.agentProfile?.country || "",
        bio: dbUser.travelerProfile?.interests || dbUser.coupleProfile?.familyBio || dbUser.agentProfile?.targetAudience || "",
        phone: "",
        // Traveler fields
        language: dbUser.travelerProfile?.language,
        budget: dbUser.travelerProfile?.budget,
        preferences: dbUser.travelerProfile?.preferences,
        foodPreferences: dbUser.travelerProfile?.foodPreferences,
        accessibility: dbUser.travelerProfile?.accessibility,
        // Host fields
        weddingLocation: dbUser.coupleProfile?.weddingLocation || "",
        traditions: dbUser.coupleProfile?.traditions || "",
        languagesSpoken: dbUser.coupleProfile?.languagesSpoken || "",
        expectedGuests: dbUser.coupleProfile?.expectedGuests,
        photographyRules: dbUser.coupleProfile?.photographyRules,
        // Agent fields
        organization: dbUser.agentProfile?.organization || "",
        experienceYears: dbUser.agentProfile?.experienceYears,
        targetAudience: dbUser.agentProfile?.targetAudience || ""
      };

      setUser(loadedUser);
      setCachedUser(loadedUser);
      setLoading(false);
      setAuthState("READY");
      setDbOffline(false);

      // Validate device session atomically (max 2 active devices) in background
      try {
        const deviceId = getOrCreateClientDeviceId();
        const deviceName = getClientDeviceName();
        const deviceRes = await validateDeviceSessionAction(deviceId, { deviceName });

        if (deviceRes.status === "DEVICE_LIMIT_REACHED") {
          setActiveDeviceSessions(deviceRes.activeSessions);
          setAuthState("DEVICE_LIMIT_REACHED");
          return;
        }

        if (deviceRes.status === "REVOKED") {
          setAuthState("SESSION_REVOKED");
          return;
        }
      } catch (deviceErr) {
        console.warn("Device session validation warning (graceful fallback):", deviceErr);
      }

      // Load non-critical dashboard data asynchronously without blocking user display
      try {
        const dashData = await fetchDashboardDataAction();
        if (dashData) {
          setBookings(dashData.bookings || []);
          setWishlist(dashData.wishlist || []);
          setNotifications(dashData.notifications || []);
          setGuestApplications(dashData.guestApplications || []);
          setHostWedding(dashData.hostWedding || null);
          setCoupleStats(dashData.coupleStats || null);
          setAdminStats(dashData.adminStats || null);
          setVerification(dashData.verification || null);

          // Update client-side cache for instant display on next visit
          setCachedDashboardData({
            wishlist: dashData.wishlist || [],
            notifications: dashData.notifications || [],
            unreadCount: (dashData.notifications || []).filter((n: any) => !n.read).length,
          });
        }
      } catch (err: any) {
        console.warn("Dashboard data fetch warning (transient DB error?):", err);
        setDataError(err?.message || "Unable to load dashboard data. Please try again.");
      } finally {
        setDataLoading(false);
      }
    } catch (err: any) {
      console.error("[AuthContext] DB unavailable during user sync:", err);
      setDbOffline(true);
      if (!user) {
        setAuthState("TEMPORARY_CONNECTION_FAILURE");
      }
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  }, [isSignedIn, user]);

  // Listen to Clerk state and perform instant fast-path or background sync
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      // Unauthenticated visitor fast-path: NO server action roundtrip needed!
      setUser(null);
      clearCachedUser();
      clearCachedDashboardData();
      setLoading(false);
      setDbOffline(false);
      setAuthState("INITIALIZING");
      return;
    }

    // Signed in with Clerk:
    // If we don't have a DB user yet, optimistically construct baseline profile from Clerk
    // so navbar avatar and name appear instantly while background sync runs.
    if (!user && clerkUser) {
      const optimisticName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] ||
        "Guest";
      const optimisticUser: User = {
        id: clerkUser.id,
        name: optimisticName,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        role: "traveler",
        onboarded: true,
        avatar: clerkUser.imageUrl || "",
      };
      setUser(optimisticUser);
      setLoading(false);
    }

    refreshData(Boolean(user));
  }, [isLoaded, isSignedIn, clerkUser]);

  // Re-sync silently on tab focus / network recovery (debounced by 30 seconds)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isSignedIn && isLoaded) {
        const now = Date.now();
        if (now - lastRefreshTimeRef.current > 30000) {
          refreshData(true);
        }
      }
    };

    const handleOnline = () => {
      if (isSignedIn && isLoaded) {
        refreshData(true);
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, [isSignedIn, isLoaded, refreshData]);

  const revokeDeviceSession = async (sessionId: string) => {
    await revokeDeviceSessionAction(sessionId);
    await refreshData(true);
  };

  const retryConnection = async () => {
    await refreshData(false);
  };

  // Auth helper redirections
  const login = () => {
    router.push("/login");
  };

  const signup = () => {
    router.push("/signup");
  };

  const logout = async () => {
    setLoading(true);
    clearCachedUser();
    clearCachedDashboardData();
    await signOut();
    setUser(null);
    setWishlist([]);
    setNotifications([]);
    setAuthState("INITIALIZING");
    setLoading(false);
    router.push("/");
  };

  const updateRole = async (role: UserRole) => {
    setLoading(true);
    await updateUserRoleAction(role.toUpperCase() as PrismaUserRole);
    await refreshData();
  };

  const completeOnboarding = async (onboardingData: any, redirectUrl?: string) => {
    setLoading(true);
    await completeOnboardingAction(onboardingData);
    await refreshData();
    router.push(redirectUrl || "/dashboard");
  };

  const updateProfile = async (profileData: Partial<User>) => {
    setLoading(true);
    await updateProfileDetails({
      name: profileData.name,
      country: profileData.country,
      bio: profileData.bio,
      language: profileData.language,
      budget: profileData.budget,
      preferences: profileData.preferences,
      foodPreferences: profileData.foodPreferences,
      accessibility: profileData.accessibility,
      weddingLocation: profileData.weddingLocation,
      traditions: profileData.traditions,
      languagesSpoken: profileData.languagesSpoken,
      expectedGuests: profileData.expectedGuests,
      photographyRules: profileData.photographyRules,
      organization: profileData.organization,
      experienceYears: profileData.experienceYears,
      targetAudience: profileData.targetAudience
    });
    await refreshData();
  };

  const toggleWishlist = async (weddingId: string) => {
    // Instant optimistic update
    setWishlist(prev => {
      const next = prev.includes(weddingId) ? prev.filter(id => id !== weddingId) : [...prev, weddingId];
      const dash = getCachedDashboardData() || { wishlist: [], notifications: [], unreadCount: 0 };
      setCachedDashboardData({ ...dash, wishlist: next });
      return next;
    });
    try {
      await toggleWishlistAction(weddingId);
    } catch (err) {
      console.warn("Wishlist toggle sync failed:", err);
    }
  };

  const addBooking = async (booking: Omit<Booking, "id">) => {
    const res = await createBookingAction({
      weddingId: booking.weddingId,
      date: typeof booking.date === "string" ? booking.date : new Date(booking.date).toISOString(),
      guestsCount: booking.guestsCount,
      attendanceSide: booking.attendanceSide as any,
    });
    if (res.success && res.booking) {
      await refreshData();
    }
  };

  const cancelBooking = async (bookingId: string) => {
    await cancelBookingAction(bookingId);
    await refreshData();
  };

  const markNotificationsRead = async () => {
    // Instant optimistic update
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      const dash = getCachedDashboardData() || { wishlist: [], notifications: [], unreadCount: 0 };
      setCachedDashboardData({ ...dash, notifications: next, unreadCount: 0 });
      return next;
    });
    try {
      await markNotificationsReadAction();
    } catch (err) {
      console.warn("Mark notifications read failed:", err);
    }
  };

  const handleGuestApplication = async (appId: string, status: "approved" | "rejected") => {
    await handleGuestApplicationAction(appId, status);
    await refreshData();
  };


  const checkoutBooking = async (bookingId: string): Promise<string | null> => {
    const res = await createCheckoutSessionAction(bookingId);
    if (res.url) {
      return res.url;
    }
    return null;
  };

  const refundBooking = async (bookingId: string) => {
    await refundBookingAction(bookingId);
    await refreshData();
  };

  const submitVerification = async (data: any) => {
    await submitVerificationAction(data);
    await refreshData();
  };

  const reviewVerification = async (verificationId: string, status: "APPROVED" | "REJECTED" | "UNDER_REVIEW", notes?: string) => {
    await reviewVerificationAction(verificationId, status, notes);
    await refreshData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        dataLoading,
        dataError,
        dbOffline,
        authState,
        activeDeviceSessions,
        bookings,
        wishlist,
        notifications,
        guestApplications,
        hostWedding,
        coupleStats,
        adminStats,
        verification,
        login,
        signup,
        logout,
        updateRole,
        completeOnboarding,
        updateProfile,
        toggleWishlist,
        addBooking,
        cancelBooking,
        markNotificationsRead,
        handleGuestApplication,
        checkoutBooking,
        refundBooking,
        submitVerification,
        reviewVerification,
        refreshData,
        revokeDeviceSession,
        retryConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

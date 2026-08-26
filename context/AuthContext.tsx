"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  refreshData: () => Promise<void>;
  revokeDeviceSession: (sessionId: string) => Promise<void>;
  retryConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbOffline, setDbOffline] = useState(false);
  const [authState, setAuthState] = useState<AuthState>("INITIALIZING");
  const [activeDeviceSessions, setActiveDeviceSessions] = useState<DeviceSessionDTO[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [guestApplications, setGuestApplications] = useState<any[]>([]);
  const [hostWedding, setHostWedding] = useState<any>(null);
  const [coupleStats, setCoupleStats] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);

  // Function to refresh state data from Postgres and validate multi-device session.
  const refreshData = useCallback(async () => {
    setLoading(true);
    setAuthState("AUTHENTICATING");

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
              const payload = JSON.parse(atob(parts[0]));
              if (payload.userId) {
                dbUser = {
                  id: payload.userId,
                  email: payload.email || `${payload.userId}@example.com`,
                  name: payload.email?.split("@")[0] || "Test User",
                  role: payload.role || "TRAVELER",
                  status: "ACTIVE",
                } as any;
              }
            }
          }
        } catch {}
      }

      if (!dbUser) {
        if (isSignedIn) {
          // Clerk is signed in but DB sync returned null
          setDbOffline(true);
          setAuthState("TEMPORARY_CONNECTION_FAILURE");
        } else {
          // Unauthenticated session
          setUser(null);
          setDbOffline(false);
          setAuthState("INITIALIZING");
        }
        setLoading(false);
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
      console.log("[AuthContext] Loaded user successfully:", loadedUser.id, loadedUser.role);

      // Validate device session atomically (max 2 active devices)
      try {
        const deviceId = getOrCreateClientDeviceId();
        const deviceName = getClientDeviceName();
        const deviceRes = await validateDeviceSessionAction(deviceId, { deviceName });

        if (deviceRes.status === "DEVICE_LIMIT_REACHED") {
          setActiveDeviceSessions(deviceRes.activeSessions);
          setAuthState("DEVICE_LIMIT_REACHED");
          setLoading(false);
          return;
        }

        if (deviceRes.status === "REVOKED") {
          setAuthState("SESSION_REVOKED");
          setLoading(false);
          return;
        }

        // Active session verified
        setAuthState("READY");
        setDbOffline(false);
      } catch (deviceErr) {
        console.warn("Device session validation warning (graceful fallback):", deviceErr);
        setAuthState("READY");
      }

      // Load non-critical dashboard data
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
        }
      } catch (err) {
        console.warn("Dashboard data fetch warning (transient DB error?):", err);
        setDbOffline(true);
      }
    } catch (err) {
      console.error("[AuthContext] DB unavailable during user sync:", err);
      // Fail safely: preserve authentication state, mark connection failure
      setDbOffline(true);
      setAuthState("TEMPORARY_CONNECTION_FAILURE");
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  // Initial mount sync & listen to Clerk/session state
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (isLoaded) {
      refreshData();
    }
  }, [isLoaded, isSignedIn, clerkUser, refreshData]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isSignedIn && isLoaded) {
        refreshData();
      }
    };

    const handleOnline = () => {
      if (isSignedIn && isLoaded) {
        refreshData();
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
    await refreshData();
  };

  const retryConnection = async () => {
    await refreshData();
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
    await signOut();
    setUser(null);
    setAuthState("INITIALIZING");
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
    await toggleWishlistAction(weddingId);
    setWishlist(prev => prev.includes(weddingId) ? prev.filter(id => id !== weddingId) : [...prev, weddingId]);
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
    await markNotificationsReadAction();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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

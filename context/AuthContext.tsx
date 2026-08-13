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

export type UserRole = "traveler" | "couple" | "agent" | "admin" | "coordinator";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbOffline, setDbOffline] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [guestApplications, setGuestApplications] = useState<any[]>([]);
  const [hostWedding, setHostWedding] = useState<any>(null);
  const [coupleStats, setCoupleStats] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);

  // Function to refresh state data from Postgres.
  // SEC-002: When the DB is unreachable (syncAndGetDbUser throws), user stays null
  // and dbOffline=true. We NEVER grant a role or set user state from stale/mock data.
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const dbUser = await syncAndGetDbUser();
      if (!dbUser) {
        // Not authenticated (Clerk session absent or user not found)
        setUser(null);
        setDbOffline(false);
        setLoading(false);
        return;
      }

      // DB is available and returned a real user record
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

      setUser({
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
      });

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
        // Dashboard data fetch failed after user sync succeeded.
        // Mark DB offline but do NOT clear the user record — user is still authenticated.
        console.warn("Dashboard data fetch warning (transient DB error?):", err);
        setDbOffline(true);
      }
    } catch (err) {
      // syncAndGetDbUser() threw — DB is unavailable.
      // SEC-002: user stays null (do not set to stale/mock data), mark DB offline.
      // The DashboardShell will show the DB-offline banner and a retry button.
      console.error("[AuthContext] DB unavailable during user sync:", err);
      setUser(null);
      setDbOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen to Clerk state
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        refreshData();
      } else {
        setUser(null);
        setDbOffline(false);
        setBookings([]);
        setWishlist([]);
        setNotifications([]);
        setGuestApplications([]);
        setHostWedding(null);
        setCoupleStats(null);
        setAdminStats(null);
        setVerification(null);
        setLoading(false);
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, refreshData]);

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
    await refreshData();
  };

  const addBooking = async (bookingData: Omit<Booking, "id">) => {
    setLoading(true);
    await createBookingAction({
      weddingId: bookingData.weddingId,
      guestsCount: bookingData.guestsCount,
      date: bookingData.date,
      // pricePerGuest and totalAmount are intentionally omitted — the server
      // calculates authoritative pricing from the wedding's DB record.
    });
    await refreshData();
  };

  const cancelBooking = async (bookingId: string) => {
    setLoading(true);
    await cancelBookingAction(bookingId);
    await refreshData();
  };

  const markNotificationsRead = async () => {
    await markNotificationsReadAction();
    await refreshData();
  };

  const handleGuestApplication = async (appId: string, status: "approved" | "rejected") => {
    setLoading(true);
    await handleGuestApplicationAction(appId, status);
    await refreshData();
  };

  const checkoutBooking = async (bookingId: string) => {
    setLoading(true);
    try {
      const res = await createCheckoutSessionAction(bookingId);
      if (res?.success && res.url) {
        return res.url;
      }
    } catch (err) {
      console.error("Stripe checkout redirection failed:", err);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const refundBooking = async (bookingId: string) => {
    setLoading(true);
    try {
      await refundBookingAction(bookingId);
      await refreshData();
    } catch (err) {
      console.error("Refund processing failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async (data: any) => {
    setLoading(true);
    try {
      await submitVerificationAction(data);
      await refreshData();
    } catch (err) {
      console.error("Verification submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const reviewVerification = async (verificationId: string, status: "APPROVED" | "REJECTED" | "UNDER_REVIEW", notes?: string) => {
    setLoading(true);
    try {
      await reviewVerificationAction(verificationId, status, notes);
      await refreshData();
    } catch (err) {
      console.error("Verification review failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        dbOffline,
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
        refreshData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

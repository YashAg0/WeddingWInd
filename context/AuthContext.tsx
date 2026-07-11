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

export type UserRole = "traveler" | "couple" | "agent" | "admin";

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
  bookings: Booking[];
  wishlist: string[];
  notifications: Notification[];
  guestApplications: any[];
  hostWedding: any;
  coupleStats: any;
  adminStats: any;
  verification: any;
  login: (email: string, name: string) => void;
  signup: (email: string, name: string) => void;
  logout: () => void;
  updateRole: (role: UserRole) => void;
  completeOnboarding: (onboardingData: any) => void;
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [guestApplications, setGuestApplications] = useState<any[]>([]);
  const [hostWedding, setHostWedding] = useState<any>(null);
  const [coupleStats, setCoupleStats] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);

  // Function to refresh state data from Postgres
  const refreshData = useCallback(async () => {
    try {
      const dbUser = await syncAndGetDbUser();
      if (!dbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const roleStr = dbUser.role.toLowerCase() as UserRole;
      setUser({
        id: dbUser.id,
        name: dbUser.name || dbUser.email.split("@")[0],
        email: dbUser.email,
        role: dbUser.status === "ONBOARDING" && dbUser.role !== "ADMIN" ? null : roleStr,
        onboarded: dbUser.status === "ACTIVE" || dbUser.role === "ADMIN",
        avatar: dbUser.avatar || "",
        country: dbUser.travelerProfile?.country || dbUser.agentProfile?.country || "",
        bio: dbUser.travelerProfile?.interests || dbUser.coupleProfile?.familyBio || dbUser.agentProfile?.targetAudience || "",
        phone: ""
      });

      const dashData = await fetchDashboardDataAction();
      if (dashData) {
        setBookings(dashData.bookings);
        setWishlist(dashData.wishlist);
        setNotifications(dashData.notifications);
        setGuestApplications(dashData.guestApplications);
        setHostWedding(dashData.hostWedding);
        setCoupleStats(dashData.coupleStats);
        setAdminStats(dashData.adminStats);
        setVerification(dashData.verification);
      }
    } catch (err) {
      console.error("Failed to sync and load database user session details:", err);
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

  const completeOnboarding = async (onboardingData: any) => {
    setLoading(true);
    await completeOnboardingAction(onboardingData);
    await refreshData();
    router.push("/dashboard");
  };

  const updateProfile = async (profileData: Partial<User>) => {
    setLoading(true);
    await updateProfileDetails({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      country: profileData.country,
      bio: profileData.bio
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
      date: bookingData.date,
      guestsCount: bookingData.guestsCount,
      pricePerGuest: bookingData.pricePerGuest,
      totalAmount: bookingData.pricePerGuest * bookingData.guestsCount
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

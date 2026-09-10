/**
 * __tests__/lib/loading-vs-empty-state.test.tsx
 *
 * REGRESSION SUITE FOR STEP 8 RELEASE BLOCKER
 *
 * Explicitly asserts the core invariant:
 * "DATA STILL LOADING != EMPTY STATE"
 *
 * 1. Initial loading renders the loading state.
 * 2. Empty state is NOT rendered while data is loading (whether auth loading or dashboard dataLoading).
 * 3. Empty state IS rendered ONLY after data resolves to empty with no errors.
 * 4. Populated state IS rendered after data resolves with items.
 * 5. Error state IS rendered if data fetch fails.
 * 6. Couple and traveler views both respect the loading boundary.
 */

import React from "react";
import ReactDOMServer from "react-dom/server";
import { DashboardLoadingState, DashboardErrorState } from "@/components/dashboard/DashboardDataState";
import BookingsPage from "@/app/dashboard/bookings/page";
import NotificationsPage from "@/app/dashboard/notifications/page";
import WishlistPage from "@/app/dashboard/wishlist/page";
import * as AuthContextModule from "@/context/AuthContext";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/dashboard/bookings",
}));

// Mock framer-motion to avoid animation issues in static rendering
jest.mock("framer-motion", () => {
  const actual = jest.requireActual("react");
  return {
    motion: {
      div: ({ children, className, ...props }: any) =>
        actual.createElement("div", { className, ...props }, children),
      span: ({ children, className, ...props }: any) =>
        actual.createElement("span", { className, ...props }, children),
    },
    AnimatePresence: ({ children }: any) => children,
  };
});

// Mock BookingCard to avoid deep child rendering issues
jest.mock("@/components/dashboard/BookingCard", () => {
  return function MockBookingCard({ booking }: any) {
    return <div data-testid="mock-booking-card">{booking.weddingTitle || "Mock Wedding"}</div>;
  };
});

describe("Loading vs Empty State Architectural Regression Suite", () => {
  let mockUseAuth: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth = jest.spyOn(AuthContextModule, "useAuth");
  });

  afterEach(() => {
    mockUseAuth.mockRestore();
  });

  // =========================================================================
  // 1. Component Unit Tests: DashboardLoadingState & DashboardErrorState
  // =========================================================================
  describe("DashboardLoadingState & DashboardErrorState Components", () => {
    it("renders DashboardLoadingState with role=status and accessible message", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        <DashboardLoadingState message="Checking for pending payment requests..." />
      );
      expect(html).toContain('role="status"');
      expect(html).toContain("Checking for pending payment requests...");
      expect(html).toContain("animate-spin");
    });

    it("renders DashboardErrorState with role=alert, error message, and retry button", () => {
      const html = ReactDOMServer.renderToStaticMarkup(
        <DashboardErrorState
          title="Custom Error Title"
          message="High latency database failure"
          onRetry={() => {}}
        />
      );
      expect(html).toContain('role="alert"');
      expect(html).toContain("Custom Error Title");
      expect(html).toContain("High latency database failure");
      expect(html).toContain("Retry");
    });
  });

  // =========================================================================
  // 2. BookingsPage: Traveler Flow Invariant Tests
  // =========================================================================
  describe("BookingsPage (Traveler View)", () => {
    const mockTravelerUser = {
      id: "usr_traveler_1",
      email: "traveler@example.com",
      name: "Test Traveler",
      role: "traveler" as const,
      status: "active" as const,
    };

    it("ASSERTION 1: Initial auth loading renders loading state, NOT empty state", () => {
      mockUseAuth.mockReturnValue({
        user: mockTravelerUser,
        bookings: [],
        notifications: [],
        wishlist: [],
        loading: true,
        dataLoading: true,
        dataError: null,
        refreshData: jest.fn(),
        cancelBooking: jest.fn(),
      } as any);

      const html = ReactDOMServer.renderToStaticMarkup(<BookingsPage />);

      // MUST render loading state
      expect(html).toContain("Loading your wedding reservations and passes...");
      // MUST NOT render empty state
      expect(html).not.toContain("No confirmed passes");
      expect(html).not.toContain("No pending payments");
      expect(html).not.toContain("Browse Weddings");
    });

    it("ASSERTION 2: Data still loading in background (dataLoading: true) does NOT render empty state", () => {
      // This is the exact condition that caused the Step 8 failure:
      // Auth resolved (loading: false), but fetchDashboardDataAction is in-flight (dataLoading: true)
      mockUseAuth.mockReturnValue({
        user: mockTravelerUser,
        bookings: [],
        notifications: [],
        wishlist: [],
        loading: false,
        dataLoading: true,
        dataError: null,
        refreshData: jest.fn(),
        cancelBooking: jest.fn(),
      } as any);

      const html = ReactDOMServer.renderToStaticMarkup(<BookingsPage />);

      // MUST render loading state
      expect(html).toContain("Loading your wedding reservations and passes...");
      // MUST NOT prematurely show empty state
      expect(html).not.toContain("No confirmed passes");
      expect(html).not.toContain("No pending payments");
      expect(html).not.toContain("Browse Weddings");
    });

    it("ASSERTION 3: Empty state IS rendered ONLY after data resolves to empty without errors", () => {
      mockUseAuth.mockReturnValue({
        user: mockTravelerUser,
        bookings: [],
        notifications: [],
        wishlist: [],
        loading: false,
        dataLoading: false,
        dataError: null,
        refreshData: jest.fn(),
        cancelBooking: jest.fn(),
      } as any);

      const html = ReactDOMServer.renderToStaticMarkup(<BookingsPage />);

      // MUST NOT render loading state
      expect(html).not.toContain("Checking for pending payment requests...");
      // MUST render legitimate empty state
      expect(html).toContain("No confirmed passes");
      expect(html).toContain("Browse Weddings");
    });

    it("ASSERTION 4: Populated state IS rendered after data resolves with bookings", () => {
      const mockBooking = {
        id: "bkg_123",
        weddingId: "wdg_123",
        weddingTitle: "Grand Royal Jaipur Wedding",
        travelerId: "usr_traveler_1",
        status: "upcoming",
        eventDate: "2026-11-20",
        guestCount: 2,
        totalAmount: 18000,
        createdAt: "2026-09-01T00:00:00Z",
      };

      mockUseAuth.mockReturnValue({
        user: mockTravelerUser,
        bookings: [mockBooking],
        notifications: [],
        wishlist: [],
        loading: false,
        dataLoading: false,
        dataError: null,
        refreshData: jest.fn(),
        cancelBooking: jest.fn(),
      } as any);

      const html = ReactDOMServer.renderToStaticMarkup(<BookingsPage />);

      // MUST NOT render loading or empty state
      expect(html).not.toContain("Checking for pending payment requests...");
      expect(html).not.toContain("No confirmed passes");
      // MUST render booking card
      expect(html).toContain("Grand Royal Jaipur Wedding");
    });

    it("ASSERTION 5: Error state IS rendered if data fetch fails, NOT empty state", () => {
      mockUseAuth.mockReturnValue({
        user: mockTravelerUser,
        bookings: [],
        notifications: [],
        wishlist: [],
        loading: false,
        dataLoading: false,
        dataError: "Unable to load dashboard data. Database query timed out.",
        refreshData: jest.fn(),
        cancelBooking: jest.fn(),
      } as any);

      const html = ReactDOMServer.renderToStaticMarkup(<BookingsPage />);

      // MUST render error state
      expect(html).toContain("Unable to load reservations");
      expect(html).toContain("Database query timed out");
      // MUST NOT render empty state or loading state
      expect(html).not.toContain("No confirmed passes");
      expect(html).not.toContain("Checking for pending payment requests...");
    });
  });

  // =========================================================================
  // 3. BookingsPage: Couple Flow Invariant Tests
  // =========================================================================
  describe("BookingsPage (Couple/Host View)", () => {
    const mockCoupleUser = {
      id: "usr_couple_1",
      email: "couple@example.com",
      name: "Test Couple",
      role: "couple" as const,
      status: "active" as const,
    };

    it("renders couple loading skeleton while dataLoading: true, NOT empty guest list", () => {
      mockUseAuth.mockReturnValue({
        user: mockCoupleUser,
        bookings: [],
        notifications: [],
        wishlist: [],
        loading: false,
        dataLoading: true,
        dataError: null,
        refreshData: jest.fn(),
        cancelBooking: jest.fn(),
      } as any);

      const html = ReactDOMServer.renderToStaticMarkup(<BookingsPage />);

      expect(html).toContain("Loading confirmed attendee guest list...");
      expect(html).not.toContain("No confirmed attendees yet");
    });

    it("renders empty guest list only after dataLoading completes", () => {
      mockUseAuth.mockReturnValue({
        user: mockCoupleUser,
        bookings: [],
        notifications: [],
        wishlist: [],
        loading: false,
        dataLoading: false,
        dataError: null,
        refreshData: jest.fn(),
        cancelBooking: jest.fn(),
      } as any);

      const html = ReactDOMServer.renderToStaticMarkup(<BookingsPage />);

      expect(html).not.toContain("Loading confirmed attendee guest list...");
      expect(html).toContain("No confirmed attendees yet");
    });
  });

  // =========================================================================
  // 4. NotificationsPage & WishlistPage Invariant Tests
  // =========================================================================
  describe("NotificationsPage & WishlistPage Consumers", () => {
    const mockUser = {
      id: "usr_1",
      email: "user@example.com",
      name: "Test User",
      role: "traveler" as const,
      status: "active" as const,
    };

    it("NotificationsPage renders loading state and suppresses empty state while dataLoading", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        bookings: [],
        notifications: [],
        wishlist: [],
        loading: false,
        dataLoading: true,
        dataError: null,
        refreshData: jest.fn(),
      } as any);

      const html = ReactDOMServer.renderToStaticMarkup(<NotificationsPage />);
      expect(html).toContain("Loading your notifications...");
      expect(html).not.toContain("No notifications yet");
    });

    it("WishlistPage renders loading state and suppresses empty state while dataLoading", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        bookings: [],
        notifications: [],
        wishlist: [],
        loading: false,
        dataLoading: true,
        dataError: null,
        refreshData: jest.fn(),
      } as any);

      const html = ReactDOMServer.renderToStaticMarkup(<WishlistPage />);
      expect(html).toContain("Loading your saved celebrations...");
      expect(html).not.toContain("Your wishlist is empty");
    });
  });
});

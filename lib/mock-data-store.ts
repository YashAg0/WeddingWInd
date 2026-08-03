"use client";

/**
 * WeddingWithIndia - Mock Data Store
 *
 * SCOPE NOTE:
 * - coordinatorMockStore: PERMANENT scope for coordinator roster (not yet in Prisma).
 * - All host, agent, and booking mock stores have been fully migrated to real Prisma database queries.
 */

import { CoordinatorApplicationStatus } from "./constants/status";

// ─── COORDINATOR (permanent scope) ────────────────────────────────────────────

export interface MockCoordinatorRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  eventExperience: string;
  availability: string;
  languages: string;
  status: CoordinatorApplicationStatus;
  assignedEventTitle?: string;
  assignedDate?: string;
}

const defaultCoordinators: MockCoordinatorRecord[] = [
  {
    id: "CORD-APP-01",
    fullName: "Rohan Varma",
    email: "rohan@example.com",
    phone: "+91 98765 11223",
    city: "Udaipur",
    eventExperience: "College Fest Management (Head Coordinator)",
    availability: "Flexible (Weekends & Weekdays)",
    languages: "English, Hindi, Marwari",
    status: "approved_awaiting_placement"
  },
  {
    id: "CORD-APP-02",
    fullName: "Ananya Deshmukh",
    email: "ananya@example.com",
    phone: "+91 98765 33445",
    city: "Goa",
    eventExperience: "Campus Cultural Event Team",
    availability: "Weekends",
    languages: "English, Hindi, Konkani",
    status: "not_available_in_city"
  },
  {
    id: "CORD-APP-03",
    fullName: "Vikram Malhotra",
    email: "vikram@example.com",
    phone: "+91 98765 55667",
    city: "Jodhpur",
    eventExperience: "Hotel Front Desk & Guest Liaison",
    availability: "Flexible",
    languages: "English, Hindi, French",
    status: "placed",
    assignedEventTitle: "The Grand Maharaja Wedding",
    assignedDate: "Feb 14, 2025 (Day 1 - Mehndi)"
  }
];

const COORDINATOR_STORAGE_KEY = "wwi_mock_coordinators_v2";

class CoordinatorMockStore {
  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getCoordinators(): MockCoordinatorRecord[] {
    if (typeof window === "undefined") return defaultCoordinators;
    const item = localStorage.getItem(COORDINATOR_STORAGE_KEY);
    if (!item) {
      localStorage.setItem(COORDINATOR_STORAGE_KEY, JSON.stringify(defaultCoordinators));
      return defaultCoordinators;
    }
    try {
      return JSON.parse(item);
    } catch {
      return defaultCoordinators;
    }
  }

  public addCoordinator(record: MockCoordinatorRecord) {
    const coordinators = this.getCoordinators();
    coordinators.push(record);
    if (typeof window !== "undefined") {
      localStorage.setItem(COORDINATOR_STORAGE_KEY, JSON.stringify(coordinators));
    }
    this.notify();
  }

  public updateCoordinatorStatus(id: string, status: CoordinatorApplicationStatus, eventTitle?: string, date?: string) {
    const coordinators = this.getCoordinators();
    const updated = coordinators.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          assignedEventTitle: eventTitle || c.assignedEventTitle || "The Grand Maharaja Wedding",
          assignedDate: date || c.assignedDate || "Feb 14, 2025 (Day 1 - Welcome Feast)"
        };
      }
      return c;
    });
    if (typeof window !== "undefined") {
      localStorage.setItem(COORDINATOR_STORAGE_KEY, JSON.stringify(updated));
    }
    this.notify();
  }
}

export const coordinatorMockStore = new CoordinatorMockStore();

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

const defaultCoordinators: MockCoordinatorRecord[] = [];

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

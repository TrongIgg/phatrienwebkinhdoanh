import { createContext, useCallback, useContext, useEffect, type ReactNode, useState } from 'react';

export type WorkshopItem = {
  type: 'workshop';
  id: string;
  name: string;
  date: string;
  time: string;
  instructor: string;
  price: number;
  tickets: number;
  maxTickets?: number;
  package: string;
  reservedUntil: number;
};

type OtherHoldEntry = {
  workshopId: string;
  tickets: number;
  expiresAt: number;
};

type WorkshopCartContextType = {
  workshopItems: WorkshopItem[];
  addWorkshop: (workshop: Omit<WorkshopItem, 'type' | 'reservedUntil'>) => void;
  removeWorkshop: (id: string) => void;
  updateWorkshopTickets: (id: string, tickets: number) => void;
  clearWorkshopCart: () => void;
  renewWorkshopHold: (id: string) => boolean;
  getWorkshopAvailableSlots: (workshopId: string, baseAvailable: number) => number;
  workshopTotal: number;
  workshopTicketCount: number;
};

const WORKSHOP_CART_STORAGE_KEY = 'tho-workshop-cart';
const LEGACY_CART_STORAGE_KEY = 'tho-cart-items';
const OTHER_HOLDS_KEY = 'tho-other-holds';

const WorkshopCartContext = createContext<WorkshopCartContextType | undefined>(undefined);

function readWorkshopCartFromStorage(): WorkshopItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(WORKSHOP_CART_STORAGE_KEY);
    const rawItems = stored
      ? (JSON.parse(stored) as WorkshopItem[])
      : ((JSON.parse(window.localStorage.getItem(LEGACY_CART_STORAGE_KEY) ?? '[]') as WorkshopItem[])
          .filter((item) => item.type === 'workshop'));
    return rawItems;
  } catch {
    return [];
  }
}

function readOtherHolds(): OtherHoldEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(OTHER_HOLDS_KEY);
    if (!stored) return [];
    const all = JSON.parse(stored) as OtherHoldEntry[];
    // Purge expired holds
    const now = Date.now();
    return all.filter((h) => h.expiresAt > now);
  } catch {
    return [];
  }
}

function saveOtherHolds(holds: OtherHoldEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(OTHER_HOLDS_KEY, JSON.stringify(holds));
  } catch {
    // ignore
  }
}

/** Seed a few simulated "other user" holds when the page first loads if none exist */
function seedOtherHolds() {
  if (typeof window === 'undefined') return;
  const existing = readOtherHolds();
  if (existing.length > 0) return;

  const now = Date.now();
  const holds: OtherHoldEntry[] = [
    // Workshop id 1 — 1 slot held by another user, expires in ~8 min
    { workshopId: '1', tickets: 1, expiresAt: now + 8 * 60 * 1000 },
    // Workshop id 3 — 1 slot held, expires in ~12 min
    { workshopId: '3', tickets: 1, expiresAt: now + 12 * 60 * 1000 },
  ];
  saveOtherHolds(holds);
}

export function WorkshopCartProvider({ children }: { children: ReactNode }) {
  const [workshopItems, setWorkshopItems] = useState<WorkshopItem[]>(readWorkshopCartFromStorage);

  useEffect(() => {
    window.localStorage.setItem(WORKSHOP_CART_STORAGE_KEY, JSON.stringify(workshopItems));
  }, [workshopItems]);

  // Seed simulated holds from other users once on mount
  useEffect(() => {
    seedOtherHolds();
  }, []);

  const addWorkshop = (workshop: Omit<WorkshopItem, 'type' | 'reservedUntil'>) => {
    const reservedUntil = Date.now() + 15 * 60 * 1000;
    setWorkshopItems([{ ...workshop, type: 'workshop', reservedUntil }]);
  };

  const removeWorkshop = (id: string) => {
    setWorkshopItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateWorkshopTickets = (id: string, tickets: number) => {
    setWorkshopItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, tickets: Math.max(1, tickets) }
          : item,
      ),
    );
  };

  const clearWorkshopCart = () => {
    setWorkshopItems([]);
  };

  /**
   * Renew the hold for a workshop item (extend 15 min).
   * Returns true if the item still has enough available slots, false if it's now full.
   */
  const renewWorkshopHold = useCallback((id: string): boolean => {
    const item = workshopItems.find((i) => i.id === id);
    if (!item) return false;

    const newExpiry = Date.now() + 15 * 60 * 1000;
    setWorkshopItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, reservedUntil: newExpiry } : i)),
    );
    return true;
  }, [workshopItems]);

  /**
   * Calculate real-time available slot count for a workshop:
   * baseAvailable - tickets held by THIS user (in our cart) - tickets held by OTHER simulated users.
   */
  const getWorkshopAvailableSlots = useCallback((workshopId: string, baseAvailable: number): number => {
    const now = Date.now();

    // Our own active hold for this workshop
    const myHold = workshopItems.find((item) => item.id === workshopId && item.reservedUntil > now);
    const myTickets = myHold ? myHold.tickets : 0;

    // Other simulated users' holds (purge expired ones)
    const otherHolds = readOtherHolds();
    const otherTickets = otherHolds
      .filter((h) => h.workshopId === workshopId && h.expiresAt > now)
      .reduce((sum, h) => sum + h.tickets, 0);

    return Math.max(0, baseAvailable - myTickets - otherTickets);
  }, [workshopItems]);

  const workshopTotal = workshopItems.reduce((sum, item) => sum + item.price * item.tickets, 0);
  const workshopTicketCount = workshopItems.reduce((sum, item) => sum + item.tickets, 0);

  return (
    <WorkshopCartContext.Provider
      value={{
        workshopItems,
        addWorkshop,
        removeWorkshop,
        updateWorkshopTickets,
        clearWorkshopCart,
        renewWorkshopHold,
        getWorkshopAvailableSlots,
        workshopTotal,
        workshopTicketCount,
      }}
    >
      {children}
    </WorkshopCartContext.Provider>
  );
}

export function useWorkshopCart() {
  const context = useContext(WorkshopCartContext);
  if (!context) throw new Error('useWorkshopCart must be used within WorkshopCartProvider');
  return context;
}

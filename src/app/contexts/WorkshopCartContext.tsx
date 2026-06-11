import { createContext, useContext, useEffect, type ReactNode, useState } from 'react';

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

type WorkshopCartContextType = {
  workshopItems: WorkshopItem[];
  addWorkshop: (workshop: Omit<WorkshopItem, 'type' | 'reservedUntil'>) => void;
  removeWorkshop: (id: string) => void;
  updateWorkshopTickets: (id: string, tickets: number) => void;
  clearWorkshopCart: () => void;
  workshopTotal: number;
  workshopTicketCount: number;
};

const WORKSHOP_CART_STORAGE_KEY = 'tho-workshop-cart';
const LEGACY_CART_STORAGE_KEY = 'tho-cart-items';
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

export function WorkshopCartProvider({ children }: { children: ReactNode }) {
  const [workshopItems, setWorkshopItems] = useState<WorkshopItem[]>(readWorkshopCartFromStorage);

  useEffect(() => {
    window.localStorage.setItem(WORKSHOP_CART_STORAGE_KEY, JSON.stringify(workshopItems));
  }, [workshopItems]);

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

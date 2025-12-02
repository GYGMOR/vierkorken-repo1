'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  type: 'wine' | 'event';
  slug?: string;
  winery?: string;
  vintage?: number;
  eventDate?: string;
  maxCapacity?: number;
  currentCapacity?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vierkorken_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('vierkorken_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);

      // For event tickets, check capacity
      if (newItem.type === 'event' && newItem.maxCapacity !== undefined && newItem.currentCapacity !== undefined) {
        const availableTickets = newItem.maxCapacity - newItem.currentCapacity;
        const currentQuantityInCart = existing ? existing.quantity : 0;

        if (currentQuantityInCart >= availableTickets) {
          alert(`Es sind nur noch ${availableTickets} Tickets verfügbar für dieses Event.`);
          return prev; // Don't add
        }
      }

      if (existing) {
        // For event tickets, check if we can increase quantity
        if (newItem.type === 'event' && newItem.maxCapacity !== undefined && newItem.currentCapacity !== undefined) {
          const availableTickets = newItem.maxCapacity - newItem.currentCapacity;
          if (existing.quantity + 1 > availableTickets) {
            alert(`Es sind nur noch ${availableTickets} Tickets verfügbar für dieses Event.`);
            return prev; // Don't increase
          }
        }

        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // For event tickets, check capacity
          if (item.type === 'event' && item.maxCapacity !== undefined && item.currentCapacity !== undefined) {
            const availableTickets = item.maxCapacity - item.currentCapacity;
            if (quantity > availableTickets) {
              alert(`Es sind nur noch ${availableTickets} Tickets verfügbar für dieses Event.`);
              return { ...item, quantity: availableTickets }; // Set to max available
            }
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

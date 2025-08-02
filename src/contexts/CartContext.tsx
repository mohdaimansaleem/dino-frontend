import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, MenuItem, CartContextType } from '../types';

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('dino_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('dino_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (menuItem: MenuItem, quantity: number): void => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.menuItem.id === menuItem.id
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { menuItem, quantity }];
      }
    });
  };

  const removeItem = (menuItemId: string): void => {
    setItems(prevItems => 
      prevItems.filter(item => item.menuItem.id !== menuItemId)
    );
  };

  const updateQuantity = (menuItemId: string, quantity: number): void => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.menuItem.id === menuItemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = (): void => {
    setItems([]);
    localStorage.removeItem('dino_cart');
  };

  const getTotalAmount = (): number => {
    return items.reduce((total, item) => {
      return total + (item.menuItem.price * item.quantity);
    }, 0);
  };

  const getTotalItems = (): number => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalAmount,
    getTotalItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
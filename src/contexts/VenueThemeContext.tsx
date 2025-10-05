import React, { useState, createContext, useContext, ReactNode, useMemo } from 'react';

/**
 * Defines the shape of the venue theme context, including the current theme
 * and a function to update it.
 */
interface VenueThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

// Create the context with a default value.
const VenueThemeContext = createContext<VenueThemeContextType | undefined>(undefined);

/**
 * Provides the venue theme context to its children.
 * It holds the state for the current venue-specific theme (e.g., 'pet', 'default').
 */
export const VenueThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to 'pet' theme if nothing is set from the backend, as requested.
  const [theme, setTheme] = useState<string>('pet');

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <VenueThemeContext.Provider value={value}>{children}</VenueThemeContext.Provider>;
};

/**
 * Custom hook to use the venue theme context.
 * This makes it easy for components to access the current venue theme.
 *
 * @returns The venue theme context.
 * @throws {Error} If used outside of a VenueThemeProvider.
 */
export const useVenueTheme = (): VenueThemeContextType => {
  const context = useContext(VenueThemeContext);
  if (context === undefined) {
    throw new Error('useVenueTheme must be used within a VenueThemeProvider');
  }
  return context;
};
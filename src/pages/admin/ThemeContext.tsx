import React, { useState, createContext, useContext, ReactNode, useMemo } from 'react';

/**
 * Defines the shape of the theme context, including the current theme
 * and a function to update it.
 */
interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

// Create the context with a default value.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Provides the theme context to its children.
 * It holds the state for the current theme.
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to 'pet' theme if nothing is set from the backend, as requested.
  const [theme, setTheme] = useState<string>('pet');

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Custom hook to use the theme context.
 * This makes it easy for components to access the current theme.
 *
 * @returns The theme context.
 * @throws {Error} If used outside of a ThemeProvider.
 */
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

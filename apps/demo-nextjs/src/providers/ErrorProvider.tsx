'use client';
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ErrorContextType {
  error: string | null;
  showError: (message: string) => void;
  clearError: () => void;
}

// Create context without a default value
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const clearError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
      {error && (
        <div className="global-error-popup">
          <p>{error}</p>
          <button onClick={clearError}>×</button>
        </div>
      )}
    </ErrorContext.Provider>
  );
}

// Custom hook that uses the context
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);

  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }

  return context;
};

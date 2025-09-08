import React, { createContext, useCallback, useState, useContext } from 'react';

interface DealerContextType {
  refreshFlag: number;
  refreshDealers: () => void;
}

const DealerContext = createContext<DealerContextType | undefined>(undefined);

export const DealerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshFlag, setRefreshFlag] = useState(0);

  const refreshDealers = useCallback(() => {
    setRefreshFlag((flag) => flag + 1);
  }, []);

  return (
    <DealerContext.Provider value={{ refreshFlag, refreshDealers }}>
      {children}
    </DealerContext.Provider>
  );
};

export const useDealerContext = () => {
  const context = useContext(DealerContext);
  if (!context) {
    throw new Error('useDealerContext must be used within a DealerProvider');
  }
  return context;
};

"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type ComplexTab = "bertaca" | "seven";

interface ComplexTabContextType {
  activeTab: ComplexTab;
  setActiveTab: (tab: ComplexTab) => void;
}

const ComplexTabContext = createContext<ComplexTabContextType | undefined>(undefined);

export const ComplexTabProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState<ComplexTab>("bertaca");

  return (
    <ComplexTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ComplexTabContext.Provider>
  );
};

export const useComplexTab = () => {
  const context = useContext(ComplexTabContext);
  if (context === undefined) {
    throw new Error("useComplexTab must be used within a ComplexTabProvider");
  }
  return context;
};

"use client";

import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

type ThemeContext = {
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
};
interface SideBarProviderProps {
  children: React.ReactNode;
}

const SideBarContext = createContext<ThemeContext | null>(null);

export const useSideBarContext = () => {
  const context = useContext(SideBarContext);
  if (!context) {
    throw new Error(
      "useSideBarContext must be used within a SideBarContextProvider"
    );
  }
  return context;
};

export const SideBarProvider = ({ children }: SideBarProviderProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <SideBarContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </SideBarContext.Provider>
  );
};

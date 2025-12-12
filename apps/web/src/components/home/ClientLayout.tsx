"use client";

import React from "react";
import { ComplexTabProvider } from "@/contexts/ComplexTabContext";

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return <ComplexTabProvider>{children}</ComplexTabProvider>;
};

"use client";

import { useEffect } from "react";

export function ReactScanProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("react-scan").then(({ scan }) => {
        scan({
          enabled: true,
          log: true,
          showToolbar: true,
        });
      });
    }
  }, []);

  return null;
}

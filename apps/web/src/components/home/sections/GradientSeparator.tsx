"use client";
import React from "react";

export const GradientSeparator = React.memo(() => {
  return (
    <div className="relative h-32 bg-gradient-to-b from-black via-gray-900 to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(9, 111, 177, 0.5), transparent)",
          }}
        />
      </div>
    </div>
  );
});

GradientSeparator.displayName = "GradientSeparator";

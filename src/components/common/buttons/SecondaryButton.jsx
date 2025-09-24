import React from 'react';

export const SecondaryButton = ({ children, onClick, size = "small", color = "neutral", disabled = false }) => {
  const sizeClass = size === "small" ? "text-sm px-6 py-2" : "text-lg px-10 py-3";

  const colorClass = {
    neutral: "bg-white text-gray-900 border border-gray-300 hover:shadow-md",
    red: "bg-white text-red-700 border border-red-500 hover:shadow-md",
    green: "bg-white text-green-700 border border-green-500 hover:shadow-md",
    blue: "bg-white text-blue-700 border border-blue-500 hover:shadow-md",
  }[color] || "bg-white text-gray-900 border border-gray-300";

  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <div
      className={`flex justify-center items-center rounded-full cursor-pointer ${sizeClass} ${colorClass} ${disabledClass} transition-all duration-150 ease-in-out`}
      onClick={disabled ? null : onClick}
    >
      {children}
    </div>
  );
};

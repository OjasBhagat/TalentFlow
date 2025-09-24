import React from "react";

export const PrimaryButton = ({ children, onClick, size = "small" }) => {
  return (
    <div
      className={`${
        size === "small"
          ? "text-sm px-6 py-2"
          : "text-lg px-10 py-3"
      } bg-amber-500 text-white cursor-pointer flex items-center justify-center rounded-full 
      hover:shadow-md transition duration-150`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const buttonVariants = {
  primary:
    "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500",
  secondary:
    "bg-gray-600 hover:bg-gray-700 active:bg-gray-800 focus:ring-gray-500",
  success:
    "bg-green-600 hover:bg-green-700 active:bg-green-800 focus:ring-green-500",
  warning:
    "bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 focus:ring-yellow-500",
  danger: "bg-red-600 hover:bg-red-700 active:bg-red-800 focus:ring-red-500",
};

const buttonSizes = {
  sm: "py-1 px-3 text-sm",
  md: "py-3 px-6 text-base",
  lg: "py-4 px-8 text-lg",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  size = "md",
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
            ${buttonVariants[variant]}
            ${buttonSizes[size]}
            text-white font-bold rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-offset-2 
            transition duration-200 ease-in-out transform hover:-translate-y-0.5 
            shadow-md hover:shadow-lg 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            w-full sm:w-auto
            ${className}
        `}
  >
    {children}
  </button>
);

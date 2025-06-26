import React from "react";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
}) => (
  <div className="text-center py-8 text-gray-700 font-semibold">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <p>{message}</p>
  </div>
);

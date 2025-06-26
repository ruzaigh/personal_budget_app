import React from "react";

interface ErrorAlertProps {
  error: string;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss }) => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4"
    role="alert"
  >
    <div className="flex justify-between items-start">
      <div>
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-700 hover:text-red-900 ml-2 text-xl leading-none"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  </div>
);

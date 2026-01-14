import React, { forwardRef } from "react";

interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  isError?: boolean;
  errorMessage?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ isError, errorMessage, className, ...props }, ref) => {
    const hasError = isError || !!errorMessage;

    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`
          w-full px-3 py-2 
          bg-white border rounded-md
          outline-none
          transition-all duration-200 ease-in-out
          
          ${
            hasError
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary-100"
          }
          
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed

          ${className}
        `}
          {...props}
        />
        {errorMessage && (
          <p className={"mt-1 text-sm text-red-500 pl-1"}>{errorMessage}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;

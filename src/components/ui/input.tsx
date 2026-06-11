import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-[10px] tracking-[0.2em] uppercase text-luxury-white-muted font-semibold">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-luxury-gray-900 border border-luxury-gray-800 focus:border-gold-500 text-sm px-4 py-3.5 text-white placeholder-luxury-white-muted/40 transition-all duration-300 outline-none ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-[10px] tracking-[0.2em] uppercase text-luxury-white-muted font-semibold">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full bg-luxury-gray-900 border border-luxury-gray-800 focus:border-gold-500 text-sm px-4 py-3.5 text-white placeholder-luxury-white-muted/40 transition-all duration-300 outline-none resize-none h-32 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

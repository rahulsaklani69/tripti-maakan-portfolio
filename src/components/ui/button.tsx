import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", children, ...props }, ref) => {
    // Luxury base button styles
    const baseStyles =
      "inline-flex items-center justify-center text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-500 disabled:opacity-50 disabled:pointer-events-none px-8 py-4 border focus:outline-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-gold-500 text-black border-gold-500 hover:bg-transparent hover:text-white hover:border-white",
      secondary:
        "bg-white text-black border-white hover:bg-transparent hover:text-white hover:border-white",
      outline:
        "bg-transparent text-white border-gold-500/30 hover:border-gold-500 hover:text-gold-400 hover:bg-gold-500/5",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

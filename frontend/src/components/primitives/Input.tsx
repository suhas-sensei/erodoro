import { forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`h-11 rounded-control border bg-field px-3 text-[15px] text-txt1 transition-colors placeholder:text-txt3 focus-visible:border-focus focus-visible:outline-none ${className}`}
      style={{ borderColor: "var(--field-border)" }}
      {...props}
    />
  );
});

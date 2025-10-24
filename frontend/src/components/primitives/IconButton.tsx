export function IconButton({
  children,
  className = "",
  "aria-label": ariaLabel,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  "aria-label": string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`focus-visible:focus-ring inline-flex h-9 w-9 items-center justify-center rounded-control text-txt2 transition-colors duration-150 hover:bg-bg3 hover:text-txt1 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

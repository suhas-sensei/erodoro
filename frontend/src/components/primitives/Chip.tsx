export function Chip({
  children,
  active = false,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-8 items-center rounded-chip px-3 text-[13px] font-medium transition-colors duration-150 ${
        active
          ? "bg-blue text-white"
          : "bg-chip text-txt2 hover:bg-bg3 hover:text-txt1"
      } ${className}`}
    >
      {children}
    </button>
  );
}

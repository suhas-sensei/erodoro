export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`token-border rounded-panel bg-bg2 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

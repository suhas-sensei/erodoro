export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8">
      {children}
    </div>
  );
}

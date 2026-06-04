export function DashboardSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-sm font-medium text-neutral-900">{title}</h1>
        <p className="mt-1 text-[13px] text-neutral-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

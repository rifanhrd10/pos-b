export function PageHeader({
  title,
  breadcrumb,
  actions,
}: {
  title: string;
  description: string;
  breadcrumb: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-bayaro-blue">{breadcrumb}</p>
        <h1 className="mt-2 font-sans text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      </div>
      {actions ? <div className="flex items-center gap-3 md:self-end">{actions}</div> : null}
    </div>
  );
}

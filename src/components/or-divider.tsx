export function OrDivider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs">
      <div className="bg-border h-px flex-1" />
      <span className="text-muted-foreground">{label}</span>
      <div className="bg-border h-px flex-1" />
    </div>
  );
}

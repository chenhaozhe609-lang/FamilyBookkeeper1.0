type Props = {
  title?: string;
  children: React.ReactNode;
};

export default function Card({ title, children }: Props) {
  return (
    <div className="rounded-xl border border-border bg-green-50 shadow-sm p-4">
      {title ? <div className="text-sm font-medium opacity-80">{title}</div> : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </div>
  );
}

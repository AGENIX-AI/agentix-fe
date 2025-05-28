export interface PaneProps {
  width: string;
  children: React.ReactNode;
}

export function Pane({ width, children }: PaneProps) {
  return (
    <div className="w-full overflow-auto no-scrollbar" style={{ width }}>
      {children}
    </div>
  );
}

export interface PaneProps {
  width: string;
  children: React.ReactNode;
}

export function Pane({ width, children }: PaneProps) {
  return (
    <div className="overflow-auto no-scrollbar" style={{ width, maxWidth: width }}>
      <div className="w-full h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}

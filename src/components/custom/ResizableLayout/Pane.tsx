export interface PaneProps {
  width: string;
  children: React.ReactNode;
}

export function Pane({ width, children }: PaneProps) {
  return (
    <div className="overflow-hidden" style={{ width, maxWidth: width }}>
      <div className="w-full h-full overflow-auto no-scrollbar">
        {children}
      </div>
    </div>
  );
}

export interface PaneProps {
  width: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Pane({ width, children, style }: PaneProps) {
  // Don't set width/maxWidth when using flex styles
  const hasFlexStyle = style && ("flex" in style || "flexShrink" in style);
  const baseStyle = hasFlexStyle ? {} : { width, maxWidth: width };

  return (
    <div className="overflow-hidden" style={{ ...baseStyle, ...style }}>
      <div className="w-full h-full overflow-auto no-scrollbar">{children}</div>
    </div>
  );
}

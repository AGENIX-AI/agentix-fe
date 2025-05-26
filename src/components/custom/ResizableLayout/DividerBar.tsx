"use client";

import { cn } from "@ui/lib";

export interface DividerBarProps {
	isDragging: boolean;
	isHovering: boolean;
}

export function DividerBar({ isDragging, isHovering }: DividerBarProps) {
	return (
		<div
			className={cn(
				"md:w-1 w-8 md:h-8 h-1 rounded-full transition-all duration-150",
				isDragging
					? "bg-primary"
					: isHovering
						? "bg-primary/60"
						: "bg-muted-foreground/50",
			)}
		/>
	);
}

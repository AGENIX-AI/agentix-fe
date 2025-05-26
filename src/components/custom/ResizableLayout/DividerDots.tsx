"use client";

import { cn } from "@ui/lib";

export interface DividerDotsProps {
	isDragging: boolean;
	isHovering: boolean;
}

export function DividerDots({ isDragging, isHovering }: DividerDotsProps) {
	return (
		<div className="absolute flex md:flex-col gap-1 pointer-events-none">
			{[0, 1, 2].map((i) => (
				<div
					key={i}
					className={cn(
						"w-1 h-1 rounded-full",
						isDragging || isHovering
							? "bg-primary"
							: "bg-muted-foreground/50",
					)}
				/>
			))}
		</div>
	);
}

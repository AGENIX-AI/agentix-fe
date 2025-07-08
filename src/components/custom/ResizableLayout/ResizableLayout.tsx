import { useCallback, useEffect, useRef, useState } from "react";
import { Pane } from "./Pane";
import { Separator } from "./Separator";

export interface ResizableLayoutProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  storageKey?: string;
  disabled?: boolean;
}

export function ResizableLayout({
  leftPane,
  rightPane,
  initialLeftWidth = 50, // initial width percentage for left pane
  minLeftWidth = 20, // minimum percentage width for left pane
  maxLeftWidth = 80, // maximum percentage width for left pane
  storageKey = "edvara-chat-layout-width", // localStorage key for persisting width
  disabled = false,
}: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState<number>(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastWidthRef = useRef<number>(initialLeftWidth);

  // Load saved width from localStorage after component mounts
  useEffect(() => {
    if (initializedRef.current) return;

    try {
      const savedWidth = localStorage.getItem(storageKey);
      if (savedWidth) {
        const parsed = Number.parseFloat(savedWidth);
        if (
          !isNaN(parsed) &&
          parsed >= minLeftWidth &&
          parsed <= maxLeftWidth
        ) {
          setLeftWidth(parsed);
          lastWidthRef.current = parsed;
          return;
        }
      }
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
    }

    // If no valid saved width, use initialLeftWidth
    setLeftWidth(initialLeftWidth);
    lastWidthRef.current = initialLeftWidth;
    initializedRef.current = true;
  }, [storageKey, minLeftWidth, maxLeftWidth, initialLeftWidth]);

  // Update width when constraints change (e.g., when toggling collapse state)
  useEffect(() => {
    if (!initializedRef.current) return;

    // Ensure current width is within new constraints
    const currentWidth = lastWidthRef.current;
    if (currentWidth < minLeftWidth || currentWidth > maxLeftWidth) {
      const newWidth = Math.max(
        minLeftWidth,
        Math.min(maxLeftWidth, initialLeftWidth)
      );
      setLeftWidth(newWidth);
      lastWidthRef.current = newWidth;
    }
  }, [minLeftWidth, maxLeftWidth, initialLeftWidth]); // Using lastWidthRef.current instead of leftWidth to prevent infinite loop

  // Save width to localStorage when it changes, but debounced
  useEffect(() => {
    if (!initializedRef.current) return;

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, leftWidth.toString());
      } catch (error) {
        console.error("Failed to write to localStorage:", error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [leftWidth, storageKey]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return; // Don't start dragging if disabled
      e.preventDefault();
      setIsDragging(true);
    },
    [disabled]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return; // Don't start dragging if disabled
      e.preventDefault();
      setIsDragging(true);
    },
    [disabled]
  );

  const updateWidth = useCallback((newWidth: number) => {
    // Only update if the change is significant (more than 0.5%)
    if (Math.abs(newWidth - lastWidthRef.current) < 0.5) return;

    setLeftWidth(newWidth);
    lastWidthRef.current = newWidth;
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      // Cancel any existing animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Schedule a new animation frame
      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;

        // Calculate percentage width
        let newLeftWidth = (mouseX / containerWidth) * 100;

        // Apply constraints
        newLeftWidth = Math.max(
          minLeftWidth,
          Math.min(maxLeftWidth, newLeftWidth)
        );

        updateWidth(newLeftWidth);
        rafRef.current = null;
      });
    },
    [isDragging, minLeftWidth, maxLeftWidth, updateWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);

    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Handle touch events for mobile support
  const handleTouchMove = useCallback(
    (e: Event) => {
      const touchEvent = e as TouchEvent;
      if (!isDragging || !containerRef.current || !touchEvent.touches[0])
        return;

      // Cancel any existing animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Schedule a new animation frame
      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current || !touchEvent.touches[0]) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const touchX = touchEvent.touches[0].clientX - containerRect.left;

        // Calculate percentage width
        let newLeftWidth = (touchX / containerWidth) * 100;

        // Apply constraints
        newLeftWidth = Math.max(
          minLeftWidth,
          Math.min(maxLeftWidth, newLeftWidth)
        );

        updateWidth(newLeftWidth);
        rafRef.current = null;
      });
    },
    [isDragging, minLeftWidth, maxLeftWidth, updateWidth]
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);

      // Clean up any animation frame on unmount
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col md:flex-row w-full h-full relative "
      style={{ cursor: isDragging ? "col-resize" : "auto" }}
    >
      <Pane
        width={disabled ? "" : `${leftWidth}%`}
        style={disabled ? { flex: 1 } : undefined}
      >
        {leftPane}
      </Pane>

      <Separator
        leftWidth={leftWidth}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        disabled={disabled}
      />

      <Pane
        width={disabled ? "" : `${100 - leftWidth}%`}
        style={disabled ? { width: "48px", flexShrink: 0 } : undefined}
      >
        {rightPane}
      </Pane>
    </div>
  );
}

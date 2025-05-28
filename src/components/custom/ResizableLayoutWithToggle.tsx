import { useCallback, useEffect, useRef, useState } from "react";
import { Separator } from "./ResizableLayout/Separator";
import { Pane } from "./ResizableLayout/Pane";

export interface ResizableLayoutWithToggleProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  storageKey?: string;
  isRightPaneVisible?: boolean;
}

export function ResizableLayoutWithToggle({
  leftPane,
  rightPane,
  initialLeftWidth = 50,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  storageKey = "edvara-chat-layout-width",
  isRightPaneVisible = true,
}: ResizableLayoutWithToggleProps) {
  const [leftWidth, setLeftWidth] = useState<number>(initialLeftWidth);
  const [savedLeftWidth, setSavedLeftWidth] =
    useState<number>(initialLeftWidth);
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
          setSavedLeftWidth(parsed);
          lastWidthRef.current = parsed;
        }
      }
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
    }

    initializedRef.current = true;
  }, [storageKey, minLeftWidth, maxLeftWidth]);

  // Save width to localStorage when it changes, but debounced
  useEffect(() => {
    if (!initializedRef.current || !isRightPaneVisible) return;

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, leftWidth.toString());
      } catch (error) {
        console.error("Failed to write to localStorage:", error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [leftWidth, storageKey, isRightPaneVisible]);

  // Toggle visibility effect
  useEffect(() => {
    if (isRightPaneVisible) {
      // Restore saved width when showing right pane
      setLeftWidth(savedLeftWidth);
    } else {
      // Save current width before hiding
      setSavedLeftWidth(leftWidth);
      // Set left width to 100% when right pane is hidden
      setLeftWidth(100);
    }
  }, [isRightPaneVisible]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const updateWidth = useCallback((newWidth: number) => {
    // Only update if the change is significant (more than 0.5%)
    if (Math.abs(newWidth - lastWidthRef.current) < 0.5) return;

    setLeftWidth(newWidth);
    setSavedLeftWidth(newWidth);
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
    (e: TouchEvent) => {
      if (!isDragging || !containerRef.current || !e.touches[0]) return;

      // Cancel any existing animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Schedule a new animation frame
      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current || !e.touches[0]) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const touchX = e.touches[0].clientX - containerRect.left;

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
      document.addEventListener("touchmove", handleTouchMove as any);
      document.addEventListener("touchend", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove as any);
      document.removeEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove as any);
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
      className="flex flex-col md:flex-row w-full h-full relative transition-all duration-300"
      style={{ cursor: isDragging ? "col-resize" : "auto" }}
    >
      <Pane width={`${leftWidth}%`}>{leftPane}</Pane>

      {isRightPaneVisible && (
        <>
          <Separator
            leftWidth={leftWidth}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />

          <Pane width={`${100 - leftWidth}%`}>{rightPane}</Pane>
        </>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { getCredits, type Credits } from "@/api/payments";

export const useCreditsPolling = (intervalMs: number = 5000) => {
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCredits = async () => {
    try {
      setError(null);
      const data = await getCredits();
      setCredits(data);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch credits");
      setIsLoading(false);
      console.error("Error fetching credits:", err);
    }
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchCredits();

    // Set up polling interval
    intervalRef.current = setInterval(fetchCredits, intervalMs);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMs]);

  // Cleanup interval when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { credits, isLoading, error, refetch: fetchCredits };
};

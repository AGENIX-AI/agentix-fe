import { useEffect, useState } from 'react';

/**
 * Custom hook to store and retrieve values from localStorage with debounce
 * @param key The localStorage key to use
 * @param initialValue Initial value if none exists in localStorage
 * @param delay Debounce delay in milliseconds
 * @returns Tuple containing the value and a setter function
 */
export function useDebouncedLocalStorage<T>(
  key: string, 
  initialValue: T, 
  delay = 500
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Get stored value from localStorage or use initialValue
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  // Update localStorage with debounce when value changes
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }, delay);

    return () => clearTimeout(handler); // Clear timeout if value changes again before delay has passed
  }, [value, key, delay]);

  return [value, setValue];
}

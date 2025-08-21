import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button, buttonVariants } from "./button";
import type { VariantProps } from "class-variance-authority";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  triggerLabel?: React.ReactNode;
  optionClassName?: string;
  optionLabelClassName?: string;
  triggerVariant?: VariantProps<typeof buttonVariants>["variant"];
  triggerSize?: VariantProps<typeof buttonVariants>["size"];
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
  triggerLabel,
  optionClassName,
  optionLabelClassName,
  triggerVariant = "outline",
  triggerSize = "default",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedValue, setSelectedValue] = React.useState(value || "");

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      setSelectedValue(currentValue);
      onValueChange?.(currentValue);
      setOpen(false);
    },
    [onValueChange]
  );

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue]
  );

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            triggerLabel
              ? "w-auto min-w-0 justify-center"
              : "w-full justify-between",
            disabled && "opacity-50 cursor-not-allowed",
            triggerClassName
          )}
        >
          {triggerLabel ??
            (selectedOption ? selectedOption.label : placeholder)}
          {!triggerLabel && (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", contentClassName)}>
        <div className={cn("flex flex-col", className)}>
          <div className="flex items-center border-b px-3">
            <Input
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              className="h-9 w-full bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm p-2 my-0.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    optionClassName,
                    selectedValue === option.value &&
                      "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValue === option.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <span className={cn(optionLabelClassName)}>
                    {option.label}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm">{emptyMessage}</div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { PlusCircle, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
interface CapabilityStatementProps {
  speciality: string;
  capabilities: string[];
  onSpecialityChange: (value: string) => void;
  onCapabilityAdd: () => void;
  onCapabilityChange: (index: number, value: string) => void;
  onCapabilityRemove: (index: number) => void;
  onGenerateCapabilitiesWithAI?: () => void;
  isGeneratingCapabilities?: boolean;
  className?: string;
}

export function CapabilityStatement({
  speciality,
  capabilities,
  onSpecialityChange,
  onCapabilityAdd,
  onCapabilityChange,
  onCapabilityRemove,
  onGenerateCapabilitiesWithAI,
  isGeneratingCapabilities = false,
  className,
}: CapabilityStatementProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-sm font-bold">Capability Statement</h2>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-3">
            <Label htmlFor="speciality" className="mb-3 block">
              Speciality
            </Label>
            {onGenerateCapabilitiesWithAI && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onGenerateCapabilitiesWithAI}
                disabled={isGeneratingCapabilities}
                className="h-8"
              >
                <Wand2 className="w-4 h-4 mr-1" />
                {isGeneratingCapabilities ? "Generating..." : "Generate by AI"}
              </Button>
            )}
          </div>
          <Input
            id="speciality"
            value={speciality}
            onChange={(e) => onSpecialityChange(e.target.value)}
            placeholder="Enter main speciality"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <Label className="mb-1">Capabilities</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onCapabilityAdd}
                className="h-8"
              >
                <PlusCircle className="w-4 h-4 mr-1" /> Add Capability
              </Button>
            </div>
          </div>

          {capabilities.length === 0 && (
            <div className="text-sm text-muted-foreground italic py-2">
              No capabilities added. Add a capability using the button above.
            </div>
          )}

          {capabilities.map((capability, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={capability}
                onChange={(e) => onCapabilityChange(index, e.target.value)}
                placeholder={`Capability ${index + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onCapabilityRemove(index)}
                className="h-10 w-10 text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

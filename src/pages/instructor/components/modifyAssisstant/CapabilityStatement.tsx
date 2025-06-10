import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Large } from "@/components/ui/typography";

interface CapabilityStatementProps {
  speciality: string;
  onSpecialityChange: (value: string) => void;
  className?: string;
}

export function CapabilityStatement({
  speciality,
  onSpecialityChange,
  className,
}: CapabilityStatementProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Large className="text-sm font-bold">Speciality</Large>
      <div className="">
        <div>
          <div className="flex justify-between items-end mb-3">
            <Label htmlFor="speciality" className="block">
              Assistant Speciality
            </Label>
          </div>
          <Input
            id="speciality"
            value={speciality}
            onChange={(e) => onSpecialityChange(e.target.value)}
            placeholder="Enter assistant's main speciality (e.g., Math Tutor, Language Coach, Career Advisor)"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Define what your assistant specializes in. This helps users
            understand your assistant's primary expertise area.
          </p>
        </div>
      </div>
    </div>
  );
}

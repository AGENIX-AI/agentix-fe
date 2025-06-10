"use client";
import { Slider } from "@/components/ui/slider";
import { StyleToneMap } from "./types";
import { cn } from "@/lib/utils";
interface StyleSettings {
  coachingStyle: number;
  empathy: number;
  responseLength: number;
  formality: number;
  acceptance: number;
  seriousness: number;
}

interface StyleToneSlidersProps {
  styleSettings: StyleSettings;
  onSliderChange: (field: keyof StyleSettings, value: number[]) => void;
  className?: string;
}

export function StyleToneSliders({
  styleSettings,
  onSliderChange,
  className,
}: StyleToneSlidersProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="text-sm font-bold">Style Tone</h2>
      <div className="space-y-3">
        {/* Coaching vs Mentoring Style */}
        <div className="spacey=3 spacex=6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Coaching style</span>
            <span className="text-sm font-medium">Mentoring style</span>
          </div>
          <Slider
            value={[styleSettings.coachingStyle]}
            min={0}
            max={100}
            step={25}
            onValueChange={(value) => onSliderChange("coachingStyle", value)}
          />
          <div className="text-xs text-right text-muted-foreground">
            {styleSettings.coachingStyle === 0
              ? StyleToneMap.instructionStyle[1]
              : styleSettings.coachingStyle === 25
              ? StyleToneMap.instructionStyle[2]
              : styleSettings.coachingStyle === 50
              ? StyleToneMap.instructionStyle[3]
              : styleSettings.coachingStyle === 75
              ? StyleToneMap.instructionStyle[4]
              : StyleToneMap.instructionStyle[5]}
          </div>
        </div>

        {/* Empathetic vs Direct */}
        <div className="spacey=3 spacex=6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Empathetic</span>
            <span className="text-sm font-medium">Direct</span>
          </div>
          <Slider
            value={[styleSettings.empathy]}
            min={0}
            max={100}
            step={25}
            onValueChange={(value) => onSliderChange("empathy", value)}
          />
          <div className="text-xs text-right text-muted-foreground">
            {styleSettings.empathy === 0
              ? StyleToneMap.communicationStyle[1]
              : styleSettings.empathy === 25
              ? StyleToneMap.communicationStyle[2]
              : styleSettings.empathy === 50
              ? StyleToneMap.communicationStyle[3]
              : styleSettings.empathy === 75
              ? StyleToneMap.communicationStyle[4]
              : StyleToneMap.communicationStyle[5]}
          </div>
        </div>

        {/* Concise vs Detailed */}
        <div className="spacey=3 spacex=6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Concise</span>
            <span className="text-sm font-medium">Detailed</span>
          </div>
          <Slider
            value={[styleSettings.responseLength]}
            min={0}
            max={100}
            step={25}
            onValueChange={(value) => onSliderChange("responseLength", value)}
          />
          <div className="text-xs text-right text-muted-foreground">
            {styleSettings.responseLength === 0
              ? StyleToneMap.responseLengthStyle[1]
              : styleSettings.responseLength === 25
              ? StyleToneMap.responseLengthStyle[2]
              : styleSettings.responseLength === 50
              ? StyleToneMap.responseLengthStyle[3]
              : styleSettings.responseLength === 75
              ? StyleToneMap.responseLengthStyle[4]
              : StyleToneMap.responseLengthStyle[5]}
          </div>
        </div>

        {/* Formal vs Casual */}
        <div className="spacey=3 spacex=6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Formal</span>
            <span className="text-sm font-medium">Casual</span>
          </div>
          <Slider
            value={[styleSettings.formality]}
            min={0}
            max={100}
            step={25}
            onValueChange={(value) => onSliderChange("formality", value)}
          />
          <div className="text-xs text-right text-muted-foreground">
            {styleSettings.formality === 0
              ? StyleToneMap.formalityStyle[1]
              : styleSettings.formality === 25
              ? StyleToneMap.formalityStyle[2]
              : styleSettings.formality === 50
              ? StyleToneMap.formalityStyle[3]
              : styleSettings.formality === 75
              ? StyleToneMap.formalityStyle[4]
              : StyleToneMap.formalityStyle[5]}
          </div>
        </div>

        {/* Accepting vs Challenging */}
        <div className="spacey=3 spacex=6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Accepting</span>
            <span className="text-sm font-medium">Challenging</span>
          </div>
          <Slider
            value={[styleSettings.acceptance]}
            min={0}
            max={100}
            step={25}
            onValueChange={(value) => onSliderChange("acceptance", value)}
          />
          <div className="text-xs text-right text-muted-foreground">
            {styleSettings.acceptance === 0
              ? StyleToneMap.assertivenessStyle[1]
              : styleSettings.acceptance === 25
              ? StyleToneMap.assertivenessStyle[2]
              : styleSettings.acceptance === 50
              ? StyleToneMap.assertivenessStyle[3]
              : styleSettings.acceptance === 75
              ? StyleToneMap.assertivenessStyle[4]
              : StyleToneMap.assertivenessStyle[5]}
          </div>
        </div>

        {/* Serious vs Jovial */}
        <div className="spacey=3 spacex=6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Serious</span>
            <span className="text-sm font-medium">Jovial</span>
          </div>
          <Slider
            value={[styleSettings.seriousness]}
            min={0}
            max={100}
            step={25}
            onValueChange={(value) => onSliderChange("seriousness", value)}
          />
          <div className="text-xs text-right text-muted-foreground">
            {styleSettings.seriousness === 0
              ? StyleToneMap.moodStyle[1]
              : styleSettings.seriousness === 25
              ? StyleToneMap.moodStyle[2]
              : styleSettings.seriousness === 50
              ? StyleToneMap.moodStyle[3]
              : styleSettings.seriousness === 75
              ? StyleToneMap.moodStyle[4]
              : StyleToneMap.moodStyle[5]}
          </div>
        </div>
      </div>
    </div>
  );
}

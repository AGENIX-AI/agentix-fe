import { Badge } from "@/components/ui/badge";
import { ExtraSmall, Large } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useInstructor } from "@/contexts/InstructorContext";

export function AssistantProfile() {
  const { assistantInfo } = useInstructor();

  if (!assistantInfo) return null;

  // Get the personality profile
  const personalityProfile = assistantInfo.personality;

  console.log("personalityProfile", personalityProfile);

  const formatPersonalityTrait = (trait: string) =>
    trait
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="px-6 py-3">
      {/* Profile Header */}
      <div className="flex items-center">
        <div className="flex-1 min-w-0 space-y-3">
          <Large className="font-bold">{assistantInfo.name}</Large>
          <ExtraSmall className="text-muted-foreground block">
            {assistantInfo.tagline}
          </ExtraSmall>
          <div className="flex items-center gap-6">
            <Badge className="flex items-center px-2 py-1">
              <ExtraSmall>{assistantInfo.language}</ExtraSmall>
            </Badge>
            <Badge className="flex items-center px-2 py-1">
              <ExtraSmall>
                Created{" "}
                {new Date(assistantInfo.created_at).toLocaleDateString()}
              </ExtraSmall>
            </Badge>
          </div>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="mb-3">
        <div className="flex items-center gap-6 mb-3">
          <Badge>About</Badge>
        </div>
        <div className="mb-3 flex items-center gap-6">
          <ExtraSmall>{assistantInfo.description}</ExtraSmall>
        </div>
      </div>
      <Separator className="my-3" />

      {/* Capabilities Section */}
      <div className="mb-3">
        <div className="flex items-center gap-6 mb-3">
          <Badge>Capabilities</Badge>
        </div>
        <div className="mb-3 flex items-center gap-6">
          <ExtraSmall className="font-semibold">Specialty:</ExtraSmall>
          <ExtraSmall>
            {assistantInfo?.speciality || "General Assistant"}
          </ExtraSmall>
        </div>
      </div>
      <Separator className="my-3" />

      {/* Personality Traits Section */}
      <div className="mb-3">
        <div className="flex items-center gap-6 mb-3">
          <Badge>Personality Traits</Badge>
        </div>
        <div className="space-y-3">
          {personalityProfile ? (
            [
              {
                trait: "instruction_style",
                value: personalityProfile.instruction_style,
              },
              {
                trait: "communication_style",
                value: personalityProfile.instruction_style,
              },
              {
                trait: "response_length_style",
                value: personalityProfile.response_length_style,
              },
              {
                trait: "formality_style",
                value: personalityProfile.formality_style,
              },
              {
                trait: "assertiveness_style",
                value: personalityProfile.assertiveness_style,
              },
              {
                trait: "mood_style",
                value: personalityProfile.mood_style,
              },
            ].map(({ trait, value }, _) => (
              <div key={trait} className="flex items-center gap-6 w-full">
                <ExtraSmall className="w-1/4 font-normal">
                  {formatPersonalityTrait(trait)}
                </ExtraSmall>
                <Progress value={value * 20} className={`flex-1`} />
                <ExtraSmall className="ml-6 w-10 text-right font-normal">
                  {value}/5
                </ExtraSmall>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">
              No personality traits available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

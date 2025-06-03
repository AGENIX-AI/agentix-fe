import { Badge } from "@/components/ui/badge";
import { ExtraSmall, Large } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Small } from "@/components/ui/typography";
import { useStudent } from "@/contexts/StudentContext";

export function AssistantProfile() {
  const { assistantInfo } = useStudent();

  if (!assistantInfo) return null;

  // Get the personality profile
  const personalityProfile = assistantInfo.personality;

  console.log("personalityProfile", personalityProfile);
  const traitColor = (value: number) => {
    if (value <= 2) return "bg-gray-200";
    if (value <= 4) return "bg-blue-200";
    return "bg-green-200";
  };

  const formatPersonalityTrait = (trait: string) =>
    trait
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="p-5 pb-0">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <div className="flex-1 min-w-0">
          <Large className="font-extrabold mb-1 leading-tight">
            {assistantInfo.name}
          </Large>
          <ExtraSmall className="text-muted-foreground block mb-4">
            {assistantInfo.tagline}
          </ExtraSmall>
          <div className="flex items-center gap-3">
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

      <Separator className="my-4" />

      <div className="mb-8">
        <div className="flex items-center gap-2  mb-4">
          <Badge>About</Badge>
        </div>
        <ExtraSmall className="mb-4 font-normal">
          {assistantInfo.description}
        </ExtraSmall>
      </div>
      <Separator className="my-4" />

      {/* Capabilities Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Badge>Capabilities</Badge>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <Small className="font-semibold">Specialty:</Small>
          <ExtraSmall>
            {assistantInfo?.speciality || "General Assistant"}
          </ExtraSmall>
        </div>
      </div>
      <Separator className="my-4" />

      {/* Personality Traits Section */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-4">
          <Badge>Personality Traits</Badge>
        </div>
        <div className="space-y-4">
          {personalityProfile ? (
            [
              {
                trait: "instruction_style",
                value: Math.max(
                  1,
                  Math.min(
                    5,
                    Math.ceil(personalityProfile.instruction_style / 2) || 3
                  )
                ),
              },
              {
                trait: "communication_style",
                value: Math.max(
                  1,
                  Math.min(
                    5,
                    Math.ceil(personalityProfile.communication_style / 2) || 3
                  )
                ),
              },
              {
                trait: "response_length_style",
                value: Math.max(
                  1,
                  Math.min(
                    5,
                    Math.ceil(personalityProfile.response_length_style / 2) || 3
                  )
                ),
              },
              {
                trait: "formality_style",
                value: Math.max(
                  1,
                  Math.min(
                    5,
                    Math.ceil(personalityProfile.formality_style / 2) || 3
                  )
                ),
              },
              {
                trait: "assertiveness_style",
                value: Math.max(
                  1,
                  Math.min(
                    5,
                    Math.ceil(personalityProfile.assertiveness_style / 2) || 3
                  )
                ),
              },
              {
                trait: "mood_style",
                value: Math.max(
                  1,
                  Math.min(5, Math.ceil(personalityProfile.mood_style / 2) || 3)
                ),
              },
            ].map(({ trait, value }, _) => (
              <div key={trait} className="flex items-center gap-3 w-full">
                <ExtraSmall className="w-1/4 font-normal">
                  {formatPersonalityTrait(trait)}
                </ExtraSmall>
                <Progress
                  value={value * 20}
                  className={`flex-1 ${traitColor(value)}`}
                />
                <ExtraSmall className="ml-2 w-10 text-right font-normal">
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

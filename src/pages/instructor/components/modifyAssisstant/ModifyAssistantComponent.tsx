import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
// Import sub-components
import { AvatarUpload } from "./AvatarUpload";
import { BasicInformation } from "./BasicInformation";
import { CapabilityStatement } from "./CapabilityStatement";
import { StyleToneSliders } from "./StyleToneSliders";
import {
  type ModifyAssistantFormData,
  mapSliderToPersonalityValue,
} from "./types";
import { useInstructor } from "@/contexts/InstructorContext";
import {
  generateAssistantImage,
  updateAssistant,
  uploadAssistantImage,
} from "@/api/assistants";
import { eventBus } from "@/lib/utils/event/eventBus";
import { Large } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ModifyAssistantComponent({
  className,
}: {
  className?: string;
}) {
  const { assistantInfo, fetchAssistantData } = useInstructor();
  const [formData, setFormData] = useState<ModifyAssistantFormData>({
    name: "",
    tagline: "",
    description: "",
    personality: undefined,
    language: "Vietnamese",
    avatar: null,
    speciality: "",
    styleSettings: {
      coachingStyle: 0,
      empathy: 0,
      responseLength: 0,
      formality: 0,
      acceptance: 0,
      seriousness: 0,
    },
  });

  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const handleInputChange = (
    field: keyof ModifyAssistantFormData,
    value: string
  ) => {
    if (!formData) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    setFormData({
      name: assistantInfo?.name || "",
      tagline: assistantInfo?.tagline || "",
      description: assistantInfo?.description || "",
      personality: assistantInfo?.personality || undefined,
      language: assistantInfo?.language || "Vietnamese",
      avatar: null,
      speciality: assistantInfo?.speciality || "",
      styleSettings: {
        coachingStyle:
          ((assistantInfo?.personality?.instruction_style ?? 3) - 1) * 25,
        empathy:
          ((assistantInfo?.personality?.communication_style ?? 3) - 1) * 25,
        responseLength:
          ((assistantInfo?.personality?.response_length_style ?? 3) - 1) * 25,
        formality:
          ((assistantInfo?.personality?.formality_style ?? 3) - 1) * 25,
        acceptance:
          ((assistantInfo?.personality?.assertiveness_style ?? 3) - 1) * 25,
        seriousness: ((assistantInfo?.personality?.mood_style ?? 3) - 1) * 25,
      },
    });
    setAvatarPreview(assistantInfo?.image || "");
  }, [assistantInfo]);

  // Create a type-safe wrapper for BasicInformation component
  const handleBasicInfoChange = (field: string, value: string) => {
    // Only allow expected field names to be updated
    if (
      field === "name" ||
      field === "tagline" ||
      field === "description" ||
      field === "language"
    ) {
      handleInputChange(field as keyof ModifyAssistantFormData, value);
    }
  };

  const handleSliderChange = (
    field: keyof typeof formData.styleSettings,
    value: number[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      styleSettings: {
        ...prev.styleSettings,
        [field]: value[0],
      },
    }));
  };

  const handleAvatarChange = (file: File) => {
    setFormData((prev) => ({ ...prev, avatar: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSpecialityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, speciality: value }));
  };

  const generateWithAI = async (
    field: "name" | "tagline" | "description" | "avatar"
  ) => {
    // Handle basic text fields generation
    if (field !== "avatar") {
      // TODO: Implement text field AI generation logic
      console.log(`Generating ${field} with AI`);
      return;
    }
  };

  const handleGenerateAvatar = async (style: string) => {
    try {
      // Get current assistant info for generating the image
      const { name, tagline, description } = formData;

      if (!name) {
        toast.error("Assistant name is required to generate an image");
        return;
      }

      // Set loading state
      setIsGeneratingAvatar(true);

      // Call API to generate image
      const response = await generateAssistantImage(
        name,
        tagline,
        description,
        style
      );

      if (response.success && response.image_base64) {
        // Convert base64 to a File object
        const base64Response = await fetch(
          `data:image/png;base64,${response.image_base64}`
        );
        const blob = await base64Response.blob();
        const file = new File(
          [blob],
          `${name.toLowerCase().replace(/\s+/g, "-")}-avatar.png`,
          { type: "image/png" }
        );

        // Update the form with the new file
        handleAvatarChange(file);

        toast.success("Avatar generated successfully");
      } else {
        toast.error("Failed to generate avatar");
      }
    } catch (error) {
      console.error("Error generating avatar:", error);
      toast.error("Failed to generate avatar");
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assistantInfo?.id) {
      toast.error("Character ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload avatar if provided
      let imagePath = avatarPreview;
      if (formData.avatar) {
        const uploadResponse = await uploadAssistantImage(formData.avatar);
        if (uploadResponse.success) {
          imagePath = uploadResponse.image_path;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      // Map slider values to personality values
      const personality = {
        instruction_style: mapSliderToPersonalityValue(
          formData.styleSettings.coachingStyle
        ),
        communication_style: mapSliderToPersonalityValue(
          formData.styleSettings.empathy
        ),
        response_length_style: mapSliderToPersonalityValue(
          formData.styleSettings.responseLength
        ),
        formality_style: mapSliderToPersonalityValue(
          formData.styleSettings.formality
        ),
        assertiveness_style: mapSliderToPersonalityValue(
          formData.styleSettings.acceptance
        ),
        mood_style: mapSliderToPersonalityValue(
          formData.styleSettings.seriousness
        ),
      };

      // Update assistant
      const updateResponse = await updateAssistant(assistantInfo.id, {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        personality,
        image: imagePath,
        language: formData.language,
        speciality: formData.speciality,
      });

      if (updateResponse.success) {
        console.log("Assistant updated successfully");
        toast.success("Assistant updated successfully");
        fetchAssistantData();
        eventBus.emit("reload-history", {});
      } else {
        console.log("Failed to update assistant");
        throw new Error("Failed to update assistant");
      }
    } catch (error) {
      console.error("Error updating assistant:", error);
      toast.error("Failed to update assistant");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="sticky top-0 z-20 bg-background flex items-center h-18 border-b w-full p-4">
        <Large className="font-bold tracking-tight">
          Modify Assistant {assistantInfo?.name}
        </Large>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-8 p-6">
          <AvatarUpload
            avatarPreview={avatarPreview}
            isGenerating={isGeneratingAvatar}
            onAvatarChange={handleAvatarChange}
            onGenerateWithAI={handleGenerateAvatar}
          />

          <Separator className="" />

          <BasicInformation
            name={formData.name}
            tagline={formData.tagline}
            description={formData.description}
            language={formData.language}
            onInputChange={handleBasicInfoChange}
            onGenerateWithAI={generateWithAI}
          />

          <Separator className="" />

          <CapabilityStatement
            speciality={formData.speciality}
            onSpecialityChange={handleSpecialityChange}
          />

          <Separator className="" />

          <StyleToneSliders
            styleSettings={formData.styleSettings}
            onSliderChange={handleSliderChange}
          />

          <Separator className="" />

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { ConversationTasks } from "./tasks";
import { AssistantProfile } from "./profile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { useStudent } from "@/contexts/StudentContext";
import { useEffect, useState } from "react";
import type { Assistant } from "@/api/assistants";
import type { InstructorProfile } from "@/api/instructor";
import { getInstructorById } from "@/api/instructor";
import { getConversationById } from "@/api/conversations";
import { LoadingState } from "@/components/ui/loading-state";

interface ConversationData {
  type?: string;
  [key: string]: unknown;
}

interface AssistantBannerProps {
  assistant: Assistant | null;
  instructor: InstructorProfile | null;
  loading: boolean;
}

function AssistantBanner({
  assistant,
  instructor,
  loading,
}: AssistantBannerProps) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="sticky top-0 bg-card h-48">
        <LoadingState
          message={t("student.assistantProfile.loading")}
          size="medium"
        />
      </div>
    );
  }

  if (!assistant || !instructor) {
    return (
      <div className="sticky top-0 bg-card h-48 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {t("student.assistantProfile.noInfo")}
        </p>
      </div>
    );
  }

  return (
    <div className="sticky top-0 bg-card">
      {/* Banner Image */}
      <div className="h-40 w-full overflow-hidden">
        <img
          src={
            instructor.background_image ||
            "https://edvara-bucket.sgp1.cdn.digitaloceanspaces.com/public/2108.w023.n001.941B.p1.941.jpg"
          }
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* Profile Section with Assistant on the left and Instructor on the right */}
      <div className="flex w-full bg-muted px-6 py-4">
        {/* Left side - Assistant */}
        <div className="flex flex-col items-center">
          <Avatar className="h-32 w-32 rounded-full border-4 border-white -mt-24">
            <AvatarImage
              src={
                assistant.image ||
                "https://api-app.edvara.net/static/default-assistant.png"
              }
              alt={assistant.name}
            />
          </Avatar>
          <h2 className="text-lg font-semibold text-center text-foreground">
            {assistant.name}
          </h2>
          <p className="text-xs text-center max-w-[150px]">
            {assistant.tagline}
          </p>
        </div>

        {/* Right side - Instructor */}
        <div className="flex-1 flex items-start mt-2">
          <Avatar className="h-12 w-12 rounded-full mr-3 ml-6">
            <AvatarImage
              src={
                instructor.profile_image ||
                "https://api-app.edvara.net/static/default-profile.png"
              }
              alt={instructor.instructor_name}
            />
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {instructor.instructor_name}
            </h3>
            <p className="text-xs">
              {instructor.instructor_description ||
                t("student.assistantProfile.generalAssistance")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssistantView({ defaultTab }: { defaultTab: string }) {
  const { t } = useTranslation();
  const { assistantId, instructorId, conversationId } = useStudent();
  const { assistantInfo } = useStudent();
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [conversationData, setConversationData] =
    useState<ConversationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assistantId) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Fetch instructor data if instructorId is available
          if (instructorId) {
            const instructorData = await getInstructorById(instructorId);
            setInstructor(instructorData);
          }

          // Fetch conversation data if conversationId is available
          if (conversationId) {
            const convData = await getConversationById(conversationId);
            setConversationData(convData);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setError(t("student.assistantProfile.error"));
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [assistantId, instructorId, conversationId]);

  // Determine if we should show the Tasks tab
  const shouldShowTasksTab = conversationData?.type !== "General";

  // Default to Profile tab
  // const defaultTab = "agentCapabilityStatement";

  return (
    <div className="flex flex-col h-full max-h-screen">
      <AssistantBanner
        assistant={assistantInfo}
        instructor={instructor}
        loading={loading}
      />

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="overflow-y-auto flex-1 pb-1">
        {shouldShowTasksTab ? (
          <Tabs defaultValue={defaultTab} className="w-full mt-2">
            <TabsList className="w-full bg-transparent border-none flex gap-2 px-6 py-3">
              <TabsTrigger
                value="tasks"
                className="py-2.5 px-4 data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-muted/70 cursor-pointer transition-colors rounded-md"
              >
                {t("student.rightPanel.tasks")}
              </TabsTrigger>
              <TabsTrigger
                value="agentCapabilityStatement"
                className="py-2.5 px-4 data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-muted/70 cursor-pointer transition-colors rounded-md"
              >
                {t("student.assistantProfile.profile")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks">
              <ConversationTasks />
            </TabsContent>
            <TabsContent value="agentCapabilityStatement">
              <AssistantProfile />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="w-full mt-2">
            <AssistantProfile />
          </div>
        )}
      </div>
    </div>
  );
}

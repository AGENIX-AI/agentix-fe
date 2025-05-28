import { ConversationTasks } from "./tasks";
import { AssistantProfile } from "./profile";
import { AssistantTopics } from "./topics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useStudent } from "@/contexts/StudentContext";
import { useEffect, useState } from "react";
import type { Assistant } from "@/api/assistants";
import { getAssistantById } from "@/api/assistants";
import type { InstructorProfile } from "@/api/instructor";
import { getInstructorById } from "@/api/instructor";
import { Loader2Icon } from "lucide-react";

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
  if (loading) {
    return (
      <div className="sticky top-0 z-10 bg-card h-48 flex items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assistant || !instructor) {
    return (
      <div className="sticky top-0 z-10 bg-card h-48 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No assistant information available
        </p>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-10 bg-card">
      {/* Banner Image */}
      <div className="h-32 w-full overflow-hidden">
        <img
          src={
            instructor.background_image ||
            "https://edvara-bucket.sgp1.cdn.digitaloceanspaces.com/public/2108.w023.n001.941B.p1.941.jpg"
          }
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* Profile Section with Instructor on the left and Assistant on the right */}
      <div className="flex w-full bg-secondary/5 p-4">
        {/* Left side - Instructor */}
        <div className="flex flex-col items-center">
          <Avatar className="h-32 w-32 rounded-full border-4 border-white -mt-24">
            <AvatarImage
              src={
                instructor.profile_image ||
                "https://api-app.edvara.net/static/default-profile.png"
              }
              alt={instructor.instructor_name}
            />
          </Avatar>
          <h2 className="text-lg font-semibold text-center">
            {instructor.instructor_name}
          </h2>
          <p className="text-xs text-center">Instructor</p>
        </div>

        {/* Right side - Assistant */}
        <div className="flex-1 flex items-start mt-2">
          <Avatar className="h-12 w-12 rounded-full mr-3 ml-6">
            <AvatarImage
              src={
                assistant.image ||
                "https://api-app.edvara.net/static/default-assistant.png"
              }
              alt={assistant.name}
            />
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold">{assistant.name}</h3>
            <p className="text-xs">{assistant.tagline}</p>
            <p className="text-xs">
              Specialized in {assistant.speciality || "General Assistance"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssistantView({ page }: { page: string }) {
  const { assistantId, instructorId } = useStudent();
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assistantId) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Fetch assistant data
          const assistantResponse = await getAssistantById(assistantId);
          if (assistantResponse.success && assistantResponse.assistant) {
            setAssistant(assistantResponse.assistant);
          }

          // Fetch instructor data if instructorId is available
          if (instructorId) {
            const instructorData = await getInstructorById(instructorId);
            setInstructor(instructorData);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Failed to load data. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [assistantId, instructorId]);

  return (
    <div className="">
      <AssistantBanner
        assistant={assistant}
        instructor={instructor}
        loading={loading}
      />

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Tabs defaultValue={page} className="w-full mt-2">
        <TabsList className="w-full bg-transparent border-none flex gap-2 p-5">
          <TabsTrigger
            value="tasks"
            className="py-4 px-6 data-[state=active]:bg-primary/8 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-muted/50 cursor-pointer transition-colors rounded-md"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="agentCapabilityStatement"
            className="py-4 px-6 data-[state=active]:bg-primary/8 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-muted/50 cursor-pointer transition-colors rounded-md"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="assistantTopics"
            className="py-4 px-6 data-[state=active]:bg-primary/8 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-muted/50 cursor-pointer transition-colors rounded-md"
          >
            Topics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <ConversationTasks />
        </TabsContent>
        <TabsContent value="agentCapabilityStatement">
          <AssistantProfile />
        </TabsContent>
        <TabsContent value="assistantTopics">
          <AssistantTopics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

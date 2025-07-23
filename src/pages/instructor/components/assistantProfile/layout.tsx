import { ConversationTasks } from "./tasks";
import { AssistantProfile } from "./profile";
import { AssistantTopics } from "./topics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useInstructor } from "@/contexts/InstructorContext";
import { useEffect, useState } from "react";
import type { InstructorProfile } from "@/api/instructor";
import { getInstructorById } from "@/api/instructor";
import { LoadingState } from "@/components/ui/loading-state";

interface AssistantBannerProps {}

export function AssistantBanner({}: AssistantBannerProps) {
  const { assistantId, instructorId, assistantInfo } = useInstructor();
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);

  useEffect(() => {
    if (assistantId) {
      const fetchData = async () => {
        try {
          // Fetch instructor data if instructorId is available
          if (instructorId) {
            const instructorData = await getInstructorById(instructorId);
            setInstructor(instructorData);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [assistantId, instructorId]);

  if (!instructor) {
    return (
      <div className="sticky top-0 z-10 bg-card h-48">
        <LoadingState message="Loading assistant profile..." size="medium" />
      </div>
    );
  }
  if (!assistantInfo || !instructor) {
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
      <div className="flex w-full bg-secondary/5 px-6 py-4">
        {/* Left side - Assistant */}
        <div className="flex flex-col items-center">
          <Avatar className="h-32 w-32 rounded-full border-4 border-white -mt-24">
            <AvatarImage
              src={
                assistantInfo.image ||
                "https://api-app.edvara.net/static/default-assistant.png"
              }
              alt={assistantInfo.name}
            />
          </Avatar>
          <h2 className="text-lg font-semibold text-center">
            {assistantInfo.name}
          </h2>
          <p className="text-xs text-center max-w-[150px]">
            {assistantInfo.tagline}
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
            <h3 className="text-sm font-semibold">
              {instructor.instructor_name}
            </h3>
            <p className="text-xs">
              {instructor.instructor_description || "General Assistance"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssistantView({ page }: { page: string }) {
  return (
    <div className="flex flex-col h-full max-h-screen">
      <AssistantBanner />

      <div className="overflow-y-auto flex-1 pb-1">
        <Tabs defaultValue={page} value={page} className="w-full mt-2">
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
    </div>
  );
}

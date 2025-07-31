// AssistantDetailsLayout component for tab-based assistant management
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { axiosInstance } from "@/api/axios-instance";
import { Loader2, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssistantDashboard } from "./tabs/AssistantDashboard";
import { AssistantProfile } from "./tabs/AssistantProfile";
import { AssistantKnowledge } from "./tabs/AssistantKnowledge";
import type { Assistant } from "@/api/assistants/index";
import { useInstructor } from "@/contexts/InstructorContext";

const AssistantDetailsLayout = ({
  defaultTab = "dashboard",
  assistantId,
}: {
  defaultTab?: string;
  assistantId: string;
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setRightPanel } = useInstructor();

  useEffect(() => {
    const fetchAssistantDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/assistants/get_by_id/${assistantId}?have_personality=True`
        );

        if (response.data) {
          setAssistant(response.data);
        } else {
          setError("Failed to fetch assistant details");
        }
      } catch (err) {
        console.error("Error fetching assistant details:", err);
        setError("An error occurred while fetching assistant details");
      } finally {
        setLoading(false);
      }
    };

    if (assistantId) {
      fetchAssistantDetails();
    }
  }, [assistantId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-xs">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (error || !assistant) {
    return (
      <div className="text-red-500 p-4">{error || "Assistant not found"}</div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        className="h-full flex flex-col w-full"
        onValueChange={(value) => {
          setActiveTab(value);
        }}
      >
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => {
                setRightPanel("assistantManager");
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold flex-1 text-center">
              {assistant.name}
            </h2>
            <div className="w-9"></div> {/* Spacer for centering */}
          </div>

          <TabsList className="mb-4 w-full">
            <TabsTrigger value="dashboard">
              {t("assistant.tabs.dashboard", "Dashboard")}
            </TabsTrigger>
            <TabsTrigger value="profile">
              {t("assistant.tabs.profile", "Profile")}
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              {t("assistant.tabs.knowledge", "Knowledge")}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <TabsContent value="dashboard" className="mt-0 h-full">
            <AssistantDashboard assistant={assistant} />
          </TabsContent>

          <TabsContent value="profile" className="mt-0 h-full">
            <AssistantProfile assistant={assistant} />
          </TabsContent>

          <TabsContent value="knowledge" className="mt-0 h-full">
            <AssistantKnowledge assistant={assistant} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AssistantDetailsLayout;

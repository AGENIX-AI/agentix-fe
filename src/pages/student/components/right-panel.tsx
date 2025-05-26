import Dashboard from "@/pages/dashboard/Dashboard";

export default function RightPanel({}) {
  //   const { rightPanel } = useAppPage();
  const rightPanel: string = "profile_info";

  switch (rightPanel) {
    case "profile_info":
      return <div className="overflow-hidden">ProfileInfo</div>;
    case "assistantTopics":
      return <div>AssistantTopics</div>;
    case "tasks":
      return <div>Tasks</div>;
    case "agentCapabilityStatement":
      return <div>AgentCapabilityStatement</div>;
    case "dashboard":
      return <Dashboard />;

    case "empty":
      return (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="sticky top-0 z-20 bg-background flex items-center h-18 border-b w-full p-4">
            <h1 className="text-2xl font-bold">Home Page</h1>
          </div>
          <div className="max-h-[calc(100vh-4.5rem)] h-full w-full flex items-center justify-center p-5 bg-background border-r border-border">
            <div className="flex items-center justify-center">
              <img
                src="https://api-app.edvara.net/static/Wavy_Tech-12_Single-01.jpg"
                alt="Edvara"
                className="w-240 h-240 object-contain"
              />
            </div>
          </div>
        </div>
      );
    default:
      return <div>RightPanel</div>;
  }
}

import { useStudent } from "@/contexts/StudentContext";
import { InstructorFinder } from "./instructorFinder/instructor-finder";
import { ChatComponent } from "./chatComponents/ChatComponent";

export function SecondPage() {
  const { chatPanel } = useStudent();
  switch (chatPanel) {
    case "findInstructor":
      return <InstructorFinder />;
    case "chat":
      return <ChatComponent />;
    default:
      return <div>Chat</div>;
  }
}

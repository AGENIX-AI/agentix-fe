import { Button } from "@/components/ui/button";
import { useStudent } from "@/contexts/StudentContext";

export default function OpenTaskPanelButton({
  children = "Open Tasks",
  onOpen,
  className,
}: {
  children?: React.ReactNode;
  onOpen?: () => void;
  className?: string;
}) {
  const { setRightPanel } = useStudent();

  return (
    <Button
      className={className}
      onClick={() => {
        setRightPanel("taskPanel");
        onOpen?.();
      }}
    >
      {children}
    </Button>
  );
}

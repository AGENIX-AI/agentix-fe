import { useState, useEffect, memo } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getListSharing } from "@/api/conversations";
import type { SharingStudent } from "@/api/conversations";
import { useInstructor } from "@/contexts/InstructorContext";

interface SharingBlockProps {
  searchQuery: string;
  sharingData?: SharingStudent[];
}

function SharingBlockComponent({
  searchQuery,
  sharingData,
}: SharingBlockProps) {
  const [sharingStudents, setSharingStudents] = useState<SharingStudent[]>(
    sharingData || []
  );
  const [isLoading, setIsLoading] = useState(!sharingData);
  const { setRightPanel, setMetaData, metaData } = useInstructor();

  // Update local state when prop changes
  useEffect(() => {
    if (sharingData) {
      setSharingStudents(sharingData);
      setIsLoading(false);
    }
  }, [sharingData]);

  const fetchSharingData = async () => {
    try {
      setIsLoading(true);
      const response = await getListSharing();
      if (response.success) {
        setSharingStudents(response.students);
      }
    } catch (error) {
      console.error("Failed to fetch sharing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Only fetch if no data provided via props
  useEffect(() => {
    if (!sharingData) {
      fetchSharingData();
    }
  }, [sharingData]);

  // Filter sharing students based on search query
  const filteredStudents = sharingStudents.filter((student) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      student.student_info.name.toLowerCase().includes(query) ||
      student.student_info.email.toLowerCase().includes(query)
    );
  });

  const handleSharingClick = (student: SharingStudent) => {
    // TODO: Implement click handler for sharing items
    console.log("Clicked on sharing student:", student);
    setMetaData({
      ...metaData,
      student_id: student.student_id,
    });
    setRightPanel("sharing_topics");
  };

  if (isLoading) {
    return (
      <LoadingState
        message="Loading sharing..."
        size="medium"
        className="h-32"
      />
    );
  }

  if (filteredStudents.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4 text-sm">
        {searchQuery ? "No sharing matches found" : "No sharing available"}
      </div>
    );
  }

  return (
    <div className="ml-1">
      {filteredStudents.map((student: SharingStudent) => (
        <div
          key={student.student_id}
          className="flex items-center gap-2 py-1 cursor-pointer hover:bg-accent/30 transition-all duration-200 rounded-2xl"
          onClick={() => handleSharingClick(student)}
        >
          <Avatar className="overflow-hidden h-5 w-5 ml-2">
            <AvatarImage
              src={student.student_info.avatar_url}
              alt={student.student_info.name}
            />
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-xs truncate">
              {student.student_info.name}
            </div>
            {/* <div className="text-xs text-muted-foreground truncate">
              {student.student_info.email}
            </div> */}
          </div>
        </div>
      ))}
    </div>
  );
}

export const SharingBlock = memo(SharingBlockComponent);

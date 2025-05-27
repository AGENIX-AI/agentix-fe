"use client";

import { ProfileBanner } from "./ProfileBanner";
import { AIAssistants } from "./AIAssistants";
import { ProfileGroups } from "./ProfileGroups";
import { ProfilePosts } from "./ProfilePosts";
import { useStudent } from "@/contexts/StudentContext";
import { ExtraSmall } from "@/components/ui/typography";
import { useEffect, useState } from "react";
import type { InstructorProfile, InstructorAssistant } from "@/api/instructor";
import { getInstructorById, getInstructorAssistants } from "@/api/instructor";

export function ProfileInfo() {
  const { instructorId } = useStudent();
  const [instructorData, setInstructorData] =
    useState<InstructorProfile | null>(null);
  const [assistants, setAssistants] = useState<InstructorAssistant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (instructorId) {
      const fetchInstructorData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Fetch instructor profile
          const instructorProfile = await getInstructorById(instructorId);
          setInstructorData(instructorProfile);

          // Fetch instructor assistants
          const instructorAssistants = await getInstructorAssistants(
            instructorId
          );
          setAssistants(instructorAssistants);
        } catch (error) {
          console.error("Error fetching instructor data:", error);
          setError("Failed to load instructor data. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchInstructorData();
    }
  }, [instructorId]);

  return (
    <div className="flex flex-col overflow-auto min-h-[100vh] border-l">
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 text-center">{error}</div>
      ) : (
        <>
          <ProfileBanner
            instructorName={instructorData?.instructor_name}
            backgroundImage={instructorData?.background_image}
            profileImage={instructorData?.profile_image}
            instructorDescription={instructorData?.instructor_description}
          />

          {/* Profile Info Section */}
          <div className="px-6">
            <ExtraSmall className="hidden">Text size reference</ExtraSmall>
            {assistants.length > 0 && <AIAssistants assistants={assistants} />}
            <ProfileGroups />
            <ProfilePosts
              instructorDescription={instructorData?.instructor_description}
            />
          </div>
        </>
      )}
    </div>
  );
}

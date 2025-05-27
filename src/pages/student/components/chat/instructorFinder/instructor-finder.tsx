import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getInstructors } from "@/api/instructor";
import type { InstructorProfile } from "@/api/instructor";
import { useStudent } from "@/contexts/StudentContext";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { ExtraSmall, H5 } from "@/components/ui/typography";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center items-center mt-6 gap-4">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ExtraSmall>{t("previous")}</ExtraSmall>
      </Button>
      <ExtraSmall>
        {t("page")} {currentPage} {t("of")} {totalPages}
      </ExtraSmall>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ExtraSmall>{t("next")}</ExtraSmall>
      </Button>
    </div>
  );
};

interface InstructorRowProps {
  instructor: InstructorProfile;
  onSelect: (instructor: InstructorProfile) => void;
  isLast?: boolean;
}

const InstructorRow: React.FC<InstructorRowProps> = ({
  instructor,
  onSelect,
  isLast = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <div className="cursor-pointer" onClick={() => onSelect(instructor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <img
                src={
                  instructor.profile_image ||
                  "https://placehold.co/100x100?text=Instructor"
                }
                alt={instructor.instructor_name}
                className="h-full w-full object-cover"
              />
            </Avatar>
            <div>
              <ExtraSmall className="font-semibold">
                {instructor.instructor_name}
              </ExtraSmall>
              <ExtraSmall className="text-muted-foreground line-clamp-2">
                {instructor.instructor_description ||
                  t("noDescriptionAvailable")}
              </ExtraSmall>
            </div>
          </div>
        </div>
      </div>
      {!isLast && <Separator />}
    </div>
  );
};

export function InstructorFinder() {
  const { t } = useTranslation();
  const { setRightPanel, setInstructorId } = useStudent();
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // No automatic API call - the user will trigger the search manually

  const fetchInstructors = async (page: number, search: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getInstructors({
        page_number: page,
        page_size: pageSize,
        sort_by: "created_at",
        sort_order: 1,
        search: search || undefined,
      });

      setInstructors(response.instructors);
      setTotalCount(response.total_count);
      setTotalPages(Math.ceil(response.total_count / pageSize));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Error fetching instructors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchInstructors(1, searchTerm);
  };

  useEffect(() => {
    fetchInstructors(1, "");
  }, []);

  const handleSelectInstructor = (instructor: InstructorProfile) => {
    setInstructorId(instructor.user_id);
    setRightPanel("profile_info");
  };

  return (
    <div className="flex flex-col p-6 h-full">
      <H5 className="mb-6">{t("findInstructor")}</H5>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("searchByName")}
          className="flex-1"
        />
        <Button type="submit">
          <ExtraSmall>{t("search")}</ExtraSmall>
        </Button>
      </form>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">
          <ExtraSmall>{t("loadingInstructors")}...</ExtraSmall>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          <ExtraSmall>
            {t("errorLoadingInstructors")}: {error}
          </ExtraSmall>
        </div>
      )}

      {!loading && !error && instructors.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ExtraSmall>{t("noInstructorsFound")}</ExtraSmall>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="flex flex-col w-full mb-6">
          {instructors.map((instructor, index) => (
            <InstructorRow
              key={instructor.id}
              instructor={instructor}
              onSelect={handleSelectInstructor}
              isLast={index === instructors.length - 1}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {totalCount > 0 && (
          <div className="text-center text-muted-foreground mt-4 mb-2">
            <ExtraSmall>
              {t("foundInstructors", { count: totalCount })}
            </ExtraSmall>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

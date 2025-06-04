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
import { ExtraSmall, H5, Small } from "@/components/ui/typography";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
    <div className="flex justify-center items-center mt-6 gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Small className="px-2">
        {currentPage} / {totalPages}
      </Small>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
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
      <div 
        className="cursor-pointer hover:bg-muted/50 rounded-md p-3 transition-colors" 
        onClick={() => onSelect(instructor)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-12 w-12 border shadow-sm">
              <img
                src={
                  instructor.profile_image ||
                  "https://placehold.co/100x100?text=Instructor"
                }
                alt={instructor.instructor_name}
                className="h-full w-full object-cover"
              />
            </Avatar>
            <div className="flex-1">
              <Small className="font-semibold">
                {instructor.instructor_name}
              </Small>
              <ExtraSmall className="text-muted-foreground line-clamp-2 mt-1">
                {instructor.instructor_description ||
                  t("noDescriptionAvailable")}
              </ExtraSmall>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8">
            <Small>{t("view")}</Small>
          </Button>
        </div>
      </div>
      {!isLast && <Separator className="my-1" />}
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
    setInstructors([]);
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchByName")}
            className="pl-10"
          />
        </div>
        <Button type="submit">
          {t("search")}
        </Button>
      </form>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-pulse flex flex-col gap-4 w-full">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-md w-full"></div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <Card className="bg-destructive/10 border-destructive/20 p-4 mb-6">
          <Small className="text-destructive">
            {t("errorLoadingInstructors")}: {error}
          </Small>
        </Card>
      )}

      {!loading && !error && instructors.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border rounded-md bg-muted/20">
          <Small>{t("noInstructorsFound")}</Small>
        </div>
      )}

      <ScrollArea className="flex-1 pr-4">
        <div className="flex flex-col w-full mb-6 gap-1">
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
          <div className="text-center mt-4 mb-2">
            <Badge variant="outline" className="bg-muted/50">
              <Small>
                {t("foundInstructors", { count: totalCount })}
              </Small>
            </Badge>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

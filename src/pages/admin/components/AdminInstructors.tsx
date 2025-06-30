import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination } from "@/components/ui/pagination";
import {
  adminApi,
  type Instructor,
  type PaginationResponse,
} from "@/api/admin";
import { InstructorDetailSidebar } from "./sidebars/InstructorDetailSidebar";

interface AdminInstructorsProps {
  searchQuery: string;
}

export function AdminInstructors({ searchQuery }: AdminInstructorsProps) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });

  // Sidebar state
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedInstructor, setSelectedInstructor] =
    useState<Instructor | null>(null);

  const showInstructorDetails = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setSidebarVisible(true);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
    setSelectedInstructor(null);
  };

  const fetchInstructors = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response: PaginationResponse<Instructor> =
        await adminApi.getInstructors({
          page_number: page,
          page_size: pagination.pageSize,
          search: search,
        });

      setInstructors(response.data);
      setPagination({
        currentPage: response.page,
        totalPages: response.total_pages,
        totalItems: response.total,
        pageSize: response.page_size,
      });
    } catch (error) {
      console.error("Failed to fetch instructors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors(1, searchQuery);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    fetchInstructors(page, searchQuery);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInstructorName = (instructor: Instructor) => {
    return (
      instructor.instructor_profile?.instructor_name || instructor.full_name
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-xs text-muted-foreground">
          Loading instructors...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Instructor
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Email
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Profile Name
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Joined
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Last Sign In
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors.map((instructor) => (
                <TableRow key={instructor.id} className="hover:bg-muted/50">
                  <TableCell className="text-xs">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={instructor.avatar_url}
                          alt={instructor.full_name}
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(instructor.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {instructor.full_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {instructor.email}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {getInstructorName(instructor)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        instructor.computed_role === "instructor"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {instructor.computed_role === "instructor"
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(instructor.created_at)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(instructor.last_sign_in_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={() => showInstructorDetails(instructor)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {instructors.length === 0 && !loading && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No instructors found matching your search.
            </div>
          )}

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Instructor Detail Sidebar */}
      <InstructorDetailSidebar
        isVisible={sidebarVisible}
        onClose={closeSidebar}
        instructor={selectedInstructor}
      />
    </>
  );
}

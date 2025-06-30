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
import { adminApi, type Student, type PaginationResponse } from "@/api/admin";
import { StudentDetailSidebar } from "./sidebars/StudentDetailSidebar";

interface AdminStudentsProps {
  searchQuery: string;
}

export function AdminStudents({ searchQuery }: AdminStudentsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });

  // Sidebar state
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const showStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setSidebarVisible(true);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
    setSelectedStudent(null);
  };

  const fetchStudents = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response: PaginationResponse<Student> = await adminApi.getStudents({
        page_number: page,
        page_size: pagination.pageSize,
        search: search,
      });

      setStudents(response.data);
      setPagination({
        currentPage: response.page,
        totalPages: response.total_pages,
        totalItems: response.total,
        pageSize: response.page_size,
      });
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1, searchQuery);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    fetchStudents(page, searchQuery);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
        <div className="text-xs text-muted-foreground">Loading students...</div>
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
                  Student
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Email
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Role
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
              {students.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/50">
                  <TableCell className="text-xs">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={student.avatar_url}
                          alt={student.full_name}
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(student.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.full_name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {student.email}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {student.computed_role}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.computed_role === "student"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {student.computed_role === "student"
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(student.created_at)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(student.last_sign_in_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={() => showStudentDetails(student)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {students.length === 0 && !loading && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No students found matching your search.
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

      {/* Student Detail Sidebar */}
      <StudentDetailSidebar
        isVisible={sidebarVisible}
        onClose={closeSidebar}
        student={selectedStudent}
      />
    </>
  );
}

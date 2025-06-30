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
  type AssistantData,
  type AssistantsResponse,
} from "@/api/admin";
import { AssistantDetailSidebar } from "./sidebars/AssistantDetailSidebar";

interface AdminAssistantsProps {
  searchQuery: string;
}

export function AdminAssistants({ searchQuery }: AdminAssistantsProps) {
  const [assistants, setAssistants] = useState<AssistantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });

  // Sidebar state
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedAssistant, setSelectedAssistant] =
    useState<AssistantData | null>(null);

  const showAssistantDetails = (assistant: AssistantData) => {
    setSelectedAssistant(assistant);
    setSidebarVisible(true);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
    setSelectedAssistant(null);
  };

  const fetchAssistants = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response: AssistantsResponse = await adminApi.getAssistants({
        page_number: page,
        page_size: pagination.pageSize,
        search: search,
        sort_by: "created_at",
        sort_order: -1,
        have_personality: true,
      });

      setAssistants(response.assistants);
      setPagination({
        currentPage: response.page_number,
        totalPages: Math.ceil(response.total_count / response.page_size),
        totalItems: response.total_count,
        pageSize: response.page_size,
      });
    } catch (error) {
      console.error("Failed to fetch assistants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants(1, searchQuery);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    fetchAssistants(page, searchQuery);
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

  const getRoleDisplay = (role: string) => {
    return role === "system" ? "System" : "User";
  };

  const getStatusDisplay = (status: string) => {
    return status === "active" ? "Active" : "Inactive";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-xs text-muted-foreground">
          Loading assistants...
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
                  Assistant
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Instructor
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Speciality
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Role
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Created
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assistants.map((assistant) => (
                <TableRow key={assistant.id} className="hover:bg-muted/50">
                  <TableCell className="text-xs">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={assistant.image}
                          alt={assistant.name}
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(assistant.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{assistant.name}</div>
                        <div className="text-muted-foreground text-[10px]">
                          {assistant.tagline}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {assistant.instructor_profile?.instructor_name || "N/A"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {assistant.speciality || "General"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {getRoleDisplay(assistant.role)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        assistant.status === "active" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {getStatusDisplay(assistant.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(assistant.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={() => showAssistantDetails(assistant)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {assistants.length === 0 && !loading && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No assistants found matching your search.
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

      {/* Assistant Detail Sidebar */}
      <AssistantDetailSidebar
        isVisible={sidebarVisible}
        onClose={closeSidebar}
        assistant={selectedAssistant}
      />
    </>
  );
}

import { useState, useEffect, useCallback } from "react";
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
import { Star } from "lucide-react";
import {
  adminApi,
  type FeedbackData,
  type FeedbacksResponse,
} from "@/api/admin";
import { FeedbackDetailSidebar } from "./sidebars/FeedbackDetailSidebar";

interface AdminFeedbacksProps {
  searchQuery: string;
}

export function AdminFeedbacks({ searchQuery }: AdminFeedbacksProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });

  // Sidebar state
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(
    null,
  );

  const showFeedbackDetails = (feedback: FeedbackData) => {
    setSelectedFeedback(feedback);
    setSidebarVisible(true);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
    setSelectedFeedback(null);
  };

  const fetchFeedbacks = useCallback(
    async (page = 1, search = "") => {
      try {
        setLoading(true);
        const response: FeedbacksResponse = await adminApi.getFeedbacks({
          page_number: page,
          page_size: pagination.pageSize,
          search: search,
          sort_by: "created_at",
          sort_order: -1,
        });

        setFeedbacks(response.feedbacks);
        setPagination({
          currentPage: response.page_number,
          totalPages: Math.ceil(response.total_count / response.page_size),
          totalItems: response.total_count,
          pageSize: response.page_size,
        });
      } catch (error) {
        console.error("Failed to fetch feedbacks:", error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageSize],
  );

  useEffect(() => {
    fetchFeedbacks(1, searchQuery);
  }, [searchQuery, fetchFeedbacks]);

  const handlePageChange = (page: number) => {
    fetchFeedbacks(page, searchQuery);
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

  const getFeedbackTypeDisplay = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-xs text-muted-foreground">
          Loading feedbacks...
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
                  User
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Description
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Rating
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
              {feedbacks.map((feedback) => (
                <TableRow key={feedback.id} className="hover:bg-muted/50">
                  <TableCell className="text-xs">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={feedback.user.avatar_url}
                          alt={feedback.user.full_name}
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(feedback.user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {feedback.user.full_name}
                        </div>
                        <div className="text-muted-foreground text-[10px]">
                          {feedback.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {getFeedbackTypeDisplay(feedback.feedback_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs">
                    {truncateText(feedback.description, 60)}
                  </TableCell>
                  <TableCell>{renderStars(feedback.rating)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={feedback.is_response ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {feedback.is_response ? "Responded" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(feedback.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={() => showFeedbackDetails(feedback)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {feedbacks.length === 0 && !loading && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No feedbacks found matching your search.
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

      {/* Feedback Detail Sidebar */}
      <FeedbackDetailSidebar
        isVisible={sidebarVisible}
        onClose={closeSidebar}
        feedback={selectedFeedback}
      />
    </>
  );
}

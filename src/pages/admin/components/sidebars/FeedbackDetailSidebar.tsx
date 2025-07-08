import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { FeedbackData } from "@/api/admin";

interface FeedbackDetailSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  feedback: FeedbackData | null;
}

export function FeedbackDetailSidebar({
  isVisible,
  onClose,
  feedback,
}: FeedbackDetailSidebarProps) {
  if (!isVisible || !feedback) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFeedbackTypeDisplay = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-background border-l border-border shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Feedback Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium">
              Feedback Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium">Feedback ID</p>
                <p className="text-muted-foreground">#{feedback.id}</p>
              </div>
              <div>
                <p className="font-medium">Type</p>
                <Badge variant="secondary" className="text-xs">
                  {getFeedbackTypeDisplay(feedback.feedback_type)}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Response Status</p>
                <Badge
                  variant={feedback.is_response ? "default" : "secondary"}
                  className="text-xs"
                >
                  {feedback.is_response ? "Responded" : "Pending"}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Rating</p>
                <div className="flex items-center gap-1">
                  {renderStars(feedback.rating)}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({feedback.rating}/5)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium">
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={feedback.user.avatar_url}
                  alt={feedback.user.full_name}
                />
                <AvatarFallback className="text-sm">
                  {getInitials(feedback.user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">
                  {feedback.user.full_name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {feedback.user.email}
                </p>
              </div>
            </div>

            <Separator />

            <div className="text-xs">
              <p className="font-medium">User ID</p>
              <p className="text-muted-foreground font-mono">
                {feedback.user_id}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
              {feedback.description}
            </p>
          </CardContent>
        </Card>

        {/* Screenshots */}
        {feedback.screenshot_urls && feedback.screenshot_urls.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium">Screenshots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {feedback.screenshot_urls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => window.open(url, "_blank")}
                    >
                      <span className="text-xs">↗</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium">Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div>
              <p className="font-medium">Created</p>
              <p className="text-muted-foreground">
                {formatDateTime(feedback.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

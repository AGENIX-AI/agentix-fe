import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AssistantData } from "@/api/admin";

interface AssistantDetailSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  assistant: AssistantData | null;
}

export function AssistantDetailSidebar({
  isVisible,
  onClose,
  assistant,
}: AssistantDetailSidebarProps) {
  if (!isVisible || !assistant) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleDisplay = (role: string) => {
    return role === "system" ? "System" : "User";
  };

  const getStatusDisplay = (status: string) => {
    return status === "active" ? "Active" : "Inactive";
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-background border-l border-border shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Assistant Details</h2>
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
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={assistant.image} alt={assistant.name} />
                <AvatarFallback className="text-sm">
                  {getInitials(assistant.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">{assistant.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {assistant.tagline}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium">Role</p>
                <p className="text-muted-foreground">
                  {getRoleDisplay(assistant.role)}
                </p>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <Badge
                  variant={
                    assistant.status === "active" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {getStatusDisplay(assistant.status)}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Language</p>
                <p className="text-muted-foreground">{assistant.language}</p>
              </div>
              <div>
                <p className="font-medium">Speciality</p>
                <p className="text-muted-foreground">
                  {assistant.speciality || "General"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {assistant.description}
            </p>
          </CardContent>
        </Card>

        {/* Instructor Info */}
        {assistant.instructor_profile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium">
                Instructor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                {assistant.instructor_profile.profile_image && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={assistant.instructor_profile.profile_image}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(
                        assistant.instructor_profile.instructor_name
                      )}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <p className="font-medium text-xs">
                    {assistant.instructor_profile.instructor_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {assistant.instructor_profile.instructor_description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personality Settings */}
        {assistant.personality && assistant.personality.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium">
                Personality Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-medium">Voice</p>
                  <p className="text-muted-foreground">
                    {assistant.personality[0].voice}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Mood Style</p>
                  <p className="text-muted-foreground">
                    {assistant.personality[0].mood_style}/5
                  </p>
                </div>
                <div>
                  <p className="font-medium">Formality</p>
                  <p className="text-muted-foreground">
                    {assistant.personality[0].formality_style}/5
                  </p>
                </div>
                <div>
                  <p className="font-medium">Assertiveness</p>
                  <p className="text-muted-foreground">
                    {assistant.personality[0].assertiveness_style}/5
                  </p>
                </div>
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
                {formatDate(assistant.created_at)}
              </p>
            </div>
            <div>
              <p className="font-medium">Last Updated</p>
              <p className="text-muted-foreground">
                {formatDate(assistant.updated_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

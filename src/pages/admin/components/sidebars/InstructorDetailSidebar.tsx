import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Instructor } from "@/api/admin";

interface InstructorDetailSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  instructor: Instructor | null;
}

export function InstructorDetailSidebar({
  isVisible,
  onClose,
  instructor,
}: InstructorDetailSidebarProps) {
  if (!isVisible || !instructor) return null;

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

  const getStatusDisplay = (role: string) => {
    return role === "instructor" ? "Active" : "Inactive";
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-background border-l border-border shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Instructor Details</h2>
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
                <AvatarImage
                  src={instructor.avatar_url}
                  alt={instructor.full_name}
                />
                <AvatarFallback className="text-sm">
                  {getInitials(instructor.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">{instructor.full_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {instructor.email}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium">Role</p>
                <p className="text-muted-foreground">
                  {instructor.computed_role}
                </p>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <Badge
                  variant={
                    instructor.computed_role === "instructor"
                      ? "default"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {getStatusDisplay(instructor.computed_role)}
                </Badge>
              </div>
              <div>
                <p className="font-medium">User ID</p>
                <p className="text-muted-foreground text-[10px] break-all">
                  {instructor.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructor Profile */}
        {instructor.instructor_profile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium">
                Instructor Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                {instructor.instructor_profile.profile_image && (
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={instructor.instructor_profile.profile_image}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(
                        instructor.instructor_profile.instructor_name
                      )}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <p className="font-medium text-xs">
                    {instructor.instructor_profile.instructor_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {instructor.instructor_profile.instructor_description}
                  </p>
                </div>
              </div>

              {instructor.instructor_profile.payment_info && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium text-xs">Payment Information</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {instructor.instructor_profile.payment_info}
                    </p>
                  </div>
                </>
              )}

              {instructor.instructor_profile.background_image && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium text-xs">Background Image</p>
                    <div className="mt-2">
                      <img
                        src={instructor.instructor_profile.background_image}
                        alt="Background"
                        className="w-full h-20 object-cover rounded border"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Account Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium">
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div>
              <p className="font-medium">Account Created</p>
              <p className="text-muted-foreground">
                {formatDate(instructor.created_at)}
              </p>
            </div>
            <div>
              <p className="font-medium">Last Sign In</p>
              <p className="text-muted-foreground">
                {formatDate(instructor.last_sign_in_at)}
              </p>
            </div>
            {instructor.instructor_profile && (
              <>
                <div>
                  <p className="font-medium">Profile Created</p>
                  <p className="text-muted-foreground">
                    {formatDate(instructor.instructor_profile.created_at)}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Profile Updated</p>
                  <p className="text-muted-foreground">
                    {formatDate(instructor.instructor_profile.updated_at)}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Send Message
            </Button>
            <Button variant="outline" size="sm" className="w-full text-xs">
              View Assistants
            </Button>
            <Button variant="outline" size="sm" className="w-full text-xs">
              Activity Log
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

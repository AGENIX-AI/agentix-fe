import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Student } from "@/api/admin";

interface StudentDetailSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  student: Student | null;
}

export function StudentDetailSidebar({
  isVisible,
  onClose,
  student,
}: StudentDetailSidebarProps) {
  if (!isVisible || !student) return null;

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
    return role === "student" ? "Active" : "Inactive";
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-background border-l border-border shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Student Details</h2>
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
                <AvatarImage src={student.avatar_url} alt={student.full_name} />
                <AvatarFallback className="text-sm">
                  {getInitials(student.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">{student.full_name}</h3>
                <p className="text-xs text-muted-foreground">{student.email}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium">Role</p>
                <p className="text-muted-foreground">{student.computed_role}</p>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <Badge
                  variant={
                    student.computed_role === "student"
                      ? "default"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {getStatusDisplay(student.computed_role)}
                </Badge>
              </div>
              <div>
                <p className="font-medium">User ID</p>
                <p className="text-muted-foreground text-[10px] break-all">
                  {student.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium">
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="font-medium">Full Name</span>
              <span className="text-muted-foreground">{student.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email</span>
              <span className="text-muted-foreground">{student.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Role</span>
              <span className="text-muted-foreground">
                {student.computed_role}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Learning Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium">
              Learning Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="font-medium">Conversations</span>
              <span className="text-muted-foreground">--</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Topics Studied</span>
              <span className="text-muted-foreground">--</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Hours Spent</span>
              <span className="text-muted-foreground">--</span>
            </div>
          </CardContent>
        </Card>

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
                {formatDate(student.created_at)}
              </p>
            </div>
            <div>
              <p className="font-medium">Last Sign In</p>
              <p className="text-muted-foreground">
                {formatDate(student.last_sign_in_at)}
              </p>
            </div>
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
              View Progress
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

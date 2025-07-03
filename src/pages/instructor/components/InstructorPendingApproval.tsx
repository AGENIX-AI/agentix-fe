import { Clock, CheckCircle, Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InstructorPendingApprovalProps {
  onRefresh: () => void;
}

export function InstructorPendingApproval({
  onRefresh,
}: InstructorPendingApprovalProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background flex items-center justify-between h-18 border-b w-full p-4">
        <h1 className="text-2xl font-bold">Instructor Application</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/student")}
          className="h-8 text-xs"
        >
          <ArrowLeft className="size-4 mr-1" />
          Back to Student
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">Application Submitted</CardTitle>
              <CardDescription>
                Your instructor request has been submitted successfully
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Application received</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span>Under review by Edvara team</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>You'll be notified via email</span>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Your application is currently being reviewed by our team. This
                  process typically takes 1-3 business days.
                </p>

                <Button
                  variant="outline"
                  onClick={onRefresh}
                  className="w-full"
                >
                  Check Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

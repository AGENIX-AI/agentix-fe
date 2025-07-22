import { Clock, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";

interface InstructorPendingDialogProps {
  onRefreshStatus: () => void;
}

export function InstructorPendingDialog({
  onRefreshStatus,
}: InstructorPendingDialogProps) {
  return (
    <DialogContent className="max-w-2xl [&>button]:hidden rounded-2xl shadow-2xl overflow-hidden p-0 mx-auto my-auto flex items-center justify-center">
      <div className="bg-[var(--background)] text-[var(--foreground)] px-8 py-8">
        {/* Header with icon */}
        <div className="text-center">
          <div className="mx-auto mb-6 w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg">
            <Clock className="w-10 h-10 text-[var(--primary-foreground)]" />
          </div>

          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl font-bold text-[var(--foreground)] text-center">
              Application Submitted
            </DialogTitle>
            <p className="text-xs text-[var(--muted-foreground)] mt-2 text-center">
              Your instructor request has been submitted successfully
            </p>
          </DialogHeader>

          {/* Progress bar */}
          <div className="w-full max-w-md mx-auto mb-8 px-4">
            <div className="relative">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-[var(--accent)]">
                <div
                  style={{ width: "40%" }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-[var(--primary-foreground)] justify-center bg-[var(--primary)]"
                ></div>
              </div>
              <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                <span>Submitted</span>
                <span>Under Review</span>
                <span>Approved</span>
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="bg-[var(--background)] rounded-xl shadow-md p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-[var(--border)]">
                <div className="flex-shrink-0 w-8 h-8 bg-[var(--muted)] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs">Application received</h4>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    We've got your submission
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 pb-3 border-b border-[var(--border)]">
                <div className="flex-shrink-0 w-8 h-8 bg-[var(--muted)] rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs">Under review</h4>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Our team is reviewing your application
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[var(--muted)] rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs">Email notification</h4>
                  <p className="text-xs ">You'll be notified when approved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estimated time and refresh button */}
          <div className="bg-[var(--accent)] bg-opacity-20 rounded-xl p-5 border border-[var(--border)] mb-6">
            <p className="text-xs text-[var(--primary)] mb-1 font-medium">
              ⏱️ Estimated Review Time
            </p>
            <p className="text-xs text-[var(--foreground)] mb-0">
              Your application is being reviewed by our team. This process
              typically takes 1-3 business days.
            </p>
          </div>

          <Button
            onClick={onRefreshStatus}
            className="w-full px-6 py-3 text-xs font-semibold bg-[var(--primary)] hover:bg-opacity-90 text-[var(--primary-foreground)] rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Check Status
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

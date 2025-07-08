import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { FeedbackType, submitFeedback } from "@/api/systems";
import { Star, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeedbackFormData {
  feedback_type: FeedbackType;
  description: string;
  rating?: number;
  screenshots?: File[];
}

export interface FeedbackFormProps {
  onClose: () => void;
  onSubmit: (formData: FeedbackFormData) => void;
  taskTitle: string;
}

export function FeedbackForm({ onClose }: FeedbackFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FeedbackFormData>({
    feedback_type: FeedbackType.BUG,
    description: "",
    rating: undefined,
    screenshots: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (formData.description.length < 10) {
      setSubmitError(
        t(
          "feedback.error.description_too_short",
          "Description must be at least 10 characters"
        )
      );
      return;
    }

    if (formData.description.length > 2000) {
      setSubmitError(
        t(
          "feedback.error.description_too_long",
          "Description must be less than 2000 characters"
        )
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await submitFeedback(
        {
          feedback_type: formData.feedback_type,
          description: formData.description,
          rating: formData.rating,
        },
        formData.screenshots
      );

      console.log("Feedback submitted successfully:", response);
      setSubmitSuccess(true);

      // Auto-close after showing success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmitError(
        t(
          "feedback.error.submit_failed",
          "Failed to submit feedback. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      setSubmitError(
        t("feedback.error.invalid_files", "Only image files are allowed")
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      screenshots: [...(prev.screenshots || []), ...imageFiles],
    }));
    setSubmitError(null);
  };

  const removeScreenshot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      screenshots: prev.screenshots?.filter((_, i) => i !== index) || [],
    }));
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
            className={cn(
              "p-1 transition-colors",
              formData.rating && star <= formData.rating
                ? "text-yellow-400"
                : "text-gray-300 hover:text-yellow-200"
            )}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
        {formData.rating && (
          <button
            onClick={() =>
              setFormData((prev) => ({ ...prev, rating: undefined }))
            }
            className="ml-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {t("feedback.clear_rating", "Clear")}
          </button>
        )}
      </div>
    );
  };

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-green-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {t("feedback.success.title", "Thank you!")}
        </h3>
        <p className="text-muted-foreground">
          {t(
            "feedback.success.message",
            "Your feedback has been submitted successfully."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="feedback_type">
          {t("feedback.type.label", "Feedback Type")} *
        </Label>
        <Select
          value={formData.feedback_type}
          onValueChange={(value: FeedbackType) =>
            setFormData((prev) => ({ ...prev, feedback_type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t(
                "feedback.type.placeholder",
                "Select feedback type"
              )}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FeedbackType.BUG}>{FeedbackType.BUG}</SelectItem>
            <SelectItem value={FeedbackType.FEATURE_REQUEST}>
              {FeedbackType.FEATURE_REQUEST}
            </SelectItem>
            <SelectItem value={FeedbackType.IMPROVEMENT}>
              {FeedbackType.IMPROVEMENT}
            </SelectItem>
            <SelectItem value={FeedbackType.GENERAL}>
              {FeedbackType.GENERAL}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          {t("feedback.description.label", "Description")} *
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder={t(
            "feedback.description.placeholder",
            "Please provide detailed feedback..."
          )}
          className="min-h-[120px]"
          maxLength={2000}
        />
        <div className="text-xs text-muted-foreground text-right">
          {formData.description.length}/2000
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          {t("feedback.rating.label", "Rating")} (
          {t("feedback.rating.optional", "optional")})
        </Label>
        {renderStarRating()}
      </div>

      <div className="space-y-2">
        <Label htmlFor="screenshots">
          {t("feedback.screenshots.label", "Screenshots")} (
          {t("feedback.screenshots.optional", "optional")})
        </Label>
        <div className="space-y-2">
          <Input
            id="screenshots"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
          />
          {formData.screenshots && formData.screenshots.length > 0 && (
            <div className="space-y-2">
              {formData.screenshots.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeScreenshot(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {submitError && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
          {submitError}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          {t("common.cancel", "Cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || formData.description.length < 10}
        >
          {isSubmitting
            ? t("feedback.submitting", "Submitting...")
            : t("feedback.submit", "Submit Feedback")}
        </Button>
      </div>
    </div>
  );
}

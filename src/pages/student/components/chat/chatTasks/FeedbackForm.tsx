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
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-xs mx-auto py-3 px-6 text-xs">
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
    <div className="space-y-6 py-3 text-xs">
      <div className="space-y-2">
        <Label htmlFor="feedback_type" className="text-xs">
          {t("feedback.type.label", "Feedback Type")} *
        </Label>
        <Select
          value={formData.feedback_type}
          onValueChange={(value: FeedbackType) =>
            setFormData((prev) => ({ ...prev, feedback_type: value }))
          }
        >
          <SelectTrigger className="text-xs min-h-8 h-8">
            <SelectValue
              placeholder={t(
                "feedback.type.placeholder",
                "Select feedback type"
              )}
            />
          </SelectTrigger>
          <SelectContent className="text-xs">
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
        <Label htmlFor="description" className="text-xs">
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
          className="min-h-[80px] text-xs"
          maxLength={2000}
        />
        <div className="text-[10px] text-muted-foreground text-right">
          {formData.description.length}/2000
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">
          {t("feedback.rating.label", "Rating")} (
          {t("feedback.rating.optional", "optional")})
        </Label>
        {renderStarRating()}
      </div>

      <div className="space-y-2">
        <Label htmlFor="screenshots" className="text-xs">
          {t("feedback.screenshots.label", "Screenshots")} (
          {t("feedback.screenshots.optional", "optional")})
        </Label>
        <div className="space-y-2">
          {/* Dropzone style */}
          <label
            htmlFor="screenshots"
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors min-h-[60px] py-4 px-2 text-center"
          >
            <Upload className="h-5 w-5 mb-1 text-gray-400" />
            <span className="text-xs text-gray-500">
              {t(
                "feedback.screenshots.drop",
                "Click or drag images here to upload"
              )}
            </span>
            <Input
              id="screenshots"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {formData.screenshots && formData.screenshots.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.screenshots.map((file, index) => {
                const url = URL.createObjectURL(file);
                return (
                  <div
                    key={index}
                    className="relative w-14 h-14 rounded overflow-hidden border border-gray-200 bg-white flex items-center justify-center"
                  >
                    <img
                      src={url}
                      alt={file.name}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-bl px-1 py-0.5 text-gray-500 hover:text-red-500"
                      aria-label="Remove screenshot"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {submitError && (
        <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
          {submitError}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="text-xs min-h-7 h-7 px-3 py-1"
        >
          {t("common.cancel", "Cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || formData.description.length < 10}
          className="text-xs min-h-7 h-7 px-3 py-1"
        >
          {isSubmitting
            ? t("feedback.submitting", "Submitting...")
            : t("feedback.submit", "Submit Feedback")}
        </Button>
      </div>
    </div>
  );
}

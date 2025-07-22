import React, { useState, useRef } from "react";
import { Loader2, Save, Upload } from "lucide-react";
import { 
  signToInstructor, 
  uploadInstructorProfileImage,
  type SignToInstructorData 
} from "@/api/instructor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogHeader,
  DialogTitle,
  DialogContent
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface InstructorSignupDialogProps {
  onSubmitted: () => void;
  isSubmittingGlobal?: boolean;
}

export function InstructorSignupDialog({
  onSubmitted,
  isSubmittingGlobal,
}: InstructorSignupDialogProps) {
  const [formData, setFormData] = useState<SignToInstructorData>({
    instructor_name: "",
    instructor_description: "",
    profile_image: "",
    background_image: "",
    payment_info: "", // Always empty as per user request
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileUploading, setIsProfileUploading] = useState(false);
  const [isBackgroundUploading, setIsBackgroundUploading] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.instructor_name.trim()) {
      toast.error("Please enter your instructor name");
      return;
    }
    if (!formData.instructor_description.trim()) {
      toast.error("Please enter your description");
      return;
    }
    setIsSubmitting(true);
    try {
      const submitData = { ...formData, payment_info: "" };
      await signToInstructor(submitData);
      toast.success("Your instructor request has been submitted successfully!");
      onSubmitted();
    } catch (error) {
      console.error("Error submitting instructor request:", error);
      toast.error("Failed to submit instructor request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setIsProfileUploading(true);
    try {
      const response = await uploadInstructorProfileImage(file);
      setFormData((prev) => ({ ...prev, profile_image: response.url }));
      toast.success("Profile image uploaded successfully");
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error("Failed to upload profile image");
    } finally {
      setIsProfileUploading(false);
      if (profileFileInputRef.current) profileFileInputRef.current.value = "";
    }
  };

  const handleBackgroundImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setIsBackgroundUploading(true);
    try {
      const response = await uploadInstructorProfileImage(file);
      setFormData((prev) => ({ ...prev, background_image: response.url }));
      toast.success("Background image uploaded successfully");
    } catch (error) {
      console.error("Error uploading background image:", error);
      toast.error("Failed to upload background image");
    } finally {
      setIsBackgroundUploading(false);
      if (backgroundFileInputRef.current)
        backgroundFileInputRef.current.value = "";
    }
  };

  return (
    <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden rounded-2xl shadow-2xl [&>button]:hidden">
      <div className="flex h-[85vh]">
        {/* Left side - Preview */}
        <div className="w-2/5 bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary-dark)] border-r border-[var(--border)]">
          <div className="bg-[var(--background)] text-[var(--foreground)] px-8 py-8">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
              <h3 className="text-lg font-semibold text-[var(--primary)]">
                Profile Preview
              </h3>
            </div>
            {/* Profile Preview Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[var(--border)]">
              {/* Background Image */}
              <div
                className="h-40 bg-gradient-to-r from-[var(--primary-light)] to-[var(--primary-dark)] relative overflow-hidden"
                style={{
                  backgroundImage: formData.background_image
                    ? `url(${formData.background_image})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-3 right-3 h-8 px-3 text-xs bg-[var(--background)]/90 hover:bg-[var(--background)] shadow-sm"
                  onClick={() => backgroundFileInputRef.current?.click()}
                  disabled={
                    isSubmitting || isBackgroundUploading || isSubmittingGlobal
                  }
                >
                  {isBackgroundUploading ? (
                    <Loader2 className="size-3 animate-spin mr-1" />
                  ) : (
                    <Upload className="size-3 mr-1" />
                  )}
                  Cover
                </Button>
              </div>
              {/* Profile Content */}
              <div className="px-6 py-4 relative">
                {/* Profile Image */}
                <div className="absolute -top-8 left-6">
                  <div className="relative">
                    <div className="mx-auto mb-6 w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      {formData.profile_image ? (
                        <img
                          src={formData.profile_image}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--background)] flex items-center justify-center">
                          <span className="text-xs font-medium text-[var(--muted-foreground)]">
                            Photo
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white border-2 border-white shadow-sm"
                      onClick={() => profileFileInputRef.current?.click()}
                      disabled={
                        isSubmitting || isProfileUploading || isSubmittingGlobal
                      }
                    >
                      {isProfileUploading ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Upload className="size-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="pt-6 flex items-center justify-center">
                  <span className="text-sm text-[var(--muted-foreground)] font-medium">
                    Profile Information
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-[var(--background-light)] rounded-lg border border-[var(--border)]">
              <p className="text-xs text-[var(--primary)] font-medium mb-1">💡 Pro Tip</p>
              <p className="text-xs text-[var(--primary-dark)]">
                Add a professional photo and compelling description to attract
                more students!
              </p>
            </div>
          </div>
          {/* Hidden File Inputs */}
          <input
            ref={profileFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfileImageUpload}
            className="hidden"
            disabled={isSubmitting || isSubmittingGlobal}
          />
          <input
            ref={backgroundFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackgroundImageUpload}
            className="hidden"
            disabled={isSubmitting || isSubmittingGlobal}
          />
        </div>
        {/* Right side - Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-[var(--background)] text-[var(--foreground)] px-8 py-8">
            <DialogHeader className="mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[var(--primary-light)] to-[var(--primary-dark)] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🎓</span>
                </div>
                <DialogTitle className="text-2xl font-bold text-[var(--primary)] mb-2">
                  Become an Instructor
                </DialogTitle>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Join our community of educators and start sharing your knowledge
                </p>
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    Basic Information
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="instructor_name"
                      className="text-sm font-medium text-[var(--foreground)] mb-2 block"
                    >
                      What should students call you? *
                    </Label>
                    <Input
                      id="instructor_name"
                      name="instructor_name"
                      type="text"
                      value={formData.instructor_name}
                      onChange={handleInputChange}
                      placeholder="e.g., Dr. Sarah Johnson, Prof. Mike Chen"
                      className="px-6 py-3 text-sm border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      required
                      disabled={isSubmitting || isSubmittingGlobal}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="instructor_description"
                      className="text-sm font-medium text-[var(--foreground)] mb-2 block"
                    >
                      Tell us about yourself *
                    </Label>
                    <Textarea
                      id="instructor_description"
                      name="instructor_description"
                      value={formData.instructor_description}
                      onChange={handleInputChange}
                      placeholder="Share your expertise, teaching philosophy, and what makes your approach unique. Students love to know who they're learning from!"
                      className="px-6 py-3 text-sm min-h-32 resize-none border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      required
                      disabled={isSubmitting || isSubmittingGlobal}
                    />
                  </div>
                </div>
              </div>
              {/* Submit Button */}
              <div className="pt-6 border-t border-[var(--border)]">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || isSubmittingGlobal}
                  className="w-full px-6 py-3 text-sm font-semibold bg-[var(--primary)] hover:bg-opacity-90 text-[var(--primary-foreground)] rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-5 mr-2 animate-spin" />
                      Submitting your application...
                    </>
                  ) : (
                    <>
                      <Save className="size-5 mr-2" />
                      Submit My Application
                    </>
                  )}
                </Button>
                <p className="text-xs text-[var(--muted-foreground)] text-center mt-3">
                  🚀 Your application will be reviewed within 1-3 business days
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

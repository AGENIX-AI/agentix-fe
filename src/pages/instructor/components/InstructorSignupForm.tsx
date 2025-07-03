import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  uploadInstructorProfileImage,
  signToInstructor,
  type SignToInstructorData,
} from "@/api/instructor";

interface InstructorSignupFormProps {
  onSuccess: () => void;
}

export function InstructorSignupForm({ onSuccess }: InstructorSignupFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignToInstructorData>({
    instructor_name: "",
    instructor_description: "",
    profile_image: "",
    background_image: "",
    payment_info: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileUploading, setIsProfileUploading] = useState(false);
  const [isBackgroundUploading, setIsBackgroundUploading] = useState(false);

  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    setIsLoading(true);

    try {
      await signToInstructor(formData);
      toast.success("Your instructor request has been submitted successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error submitting instructor request:", error);
      toast.error("Failed to submit instructor request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsProfileUploading(true);

    try {
      const response = await uploadInstructorProfileImage(file);
      if (response.success) {
        setFormData((prev) => ({ ...prev, profile_image: response.url }));
        toast.success("Profile image uploaded successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error("Failed to upload profile image. Please try again.");
    } finally {
      setIsProfileUploading(false);
      // Clear the file input
      if (profileFileInputRef.current) {
        profileFileInputRef.current.value = "";
      }
    }
  };

  const handleBackgroundImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsBackgroundUploading(true);

    try {
      const response = await uploadInstructorProfileImage(file);
      if (response.success) {
        setFormData((prev) => ({ ...prev, background_image: response.url }));
        toast.success("Background image uploaded successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading background image:", error);
      toast.error("Failed to upload background image. Please try again.");
    } finally {
      setIsBackgroundUploading(false);
      // Clear the file input
      if (backgroundFileInputRef.current) {
        backgroundFileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background flex items-center justify-between h-18 border-b w-full p-4">
        <h1 className="text-2xl font-bold">Become an Instructor</h1>
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

      {/* Profile Banner Preview */}
      <div className="relative">
        <div className="relative pb-8 border-b">
          {/* Banner Image - Clickable */}
          <div
            className="h-40 w-full overflow-hidden cursor-pointer relative group"
            onClick={() => backgroundFileInputRef.current?.click()}
          >
            <img
              src={
                formData.background_image ||
                "https://plus.unsplash.com/premium_photo-1701534008693-0eee0632d47a?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d2Vic2l0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
              }
              alt="Background preview"
              className="h-full w-full object-cover"
            />

            {/* Upload Overlay for Background */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {isBackgroundUploading ? (
                <Loader2 className="size-8 text-white animate-spin" />
              ) : (
                <div className="text-center text-white">
                  <Upload className="size-8 mx-auto mb-2" />
                  <p className="text-xs">Click to upload background</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Section with Avatar and Info side by side */}
          <div className="flex items-start px-6 -mb-4">
            {/* Left: Avatar Only */}
            <div className="flex flex-col items-center -mt-16">
              <div
                className="cursor-pointer relative group"
                onClick={() => profileFileInputRef.current?.click()}
              >
                <div className="h-32 w-32 border-2 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                  {formData.profile_image ? (
                    <img
                      src={formData.profile_image}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-primary">
                      {formData.instructor_name
                        ?.split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2) || "IN"}
                    </span>
                  )}
                </div>

                {/* Upload Overlay for Profile */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {isProfileUploading ? (
                    <Loader2 className="size-6 text-white animate-spin" />
                  ) : (
                    <Upload className="size-6 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* Right: Profile Info Preview */}
            <div className="ml-6 mt-4">
              <div className="flex items-center space-x-2">
                <h4 className="text-xl font-bold">
                  {formData.instructor_name || "Your Name"}
                </h4>
              </div>

              <p className="text-xs mt-1 line-clamp-3">
                {formData.instructor_description || "Your description..."}
              </p>
            </div>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={profileFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleProfileImageUpload}
          className="hidden"
          disabled={isLoading}
        />

        <input
          ref={backgroundFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleBackgroundImageUpload}
          className="hidden"
          disabled={isLoading}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-3">
              <h2 className="font-semibold text-xs">Basic Information</h2>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="instructor_name" className="text-xs">
                    Instructor Name *
                  </Label>
                  <Input
                    id="instructor_name"
                    name="instructor_name"
                    type="text"
                    value={formData.instructor_name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="mt-1 text-xs"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="instructor_description" className="text-xs">
                    Description *
                  </Label>
                  <Textarea
                    id="instructor_description"
                    name="instructor_description"
                    value={formData.instructor_description}
                    onChange={handleInputChange}
                    placeholder="Tell students about yourself, your teaching style, and what makes you unique"
                    className="mt-1 text-xs min-h-32 resize-none"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-3">
              <h2 className="font-semibold text-xs">Payment Information</h2>

              <div>
                <Label htmlFor="payment_info" className="text-xs">
                  Payment Details
                </Label>
                <Textarea
                  id="payment_info"
                  name="payment_info"
                  value={formData.payment_info}
                  onChange={handleInputChange}
                  placeholder="Bank account: 1234567890, Bank name: Vietcombank"
                  className="mt-1 text-xs min-h-20 resize-none"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                className="h-8 text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-1 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-1" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

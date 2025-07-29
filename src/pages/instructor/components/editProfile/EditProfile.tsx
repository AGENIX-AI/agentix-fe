import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  getInstructorProfile,
  updateInstructorProfile,
  uploadInstructorProfileImage,
  type UpdateInstructorProfileData,
  type InstructorProfile,
} from "@/api/instructor";

export function EditProfile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [formData, setFormData] = useState<UpdateInstructorProfileData>({
    instructor_name: "",
    instructor_description: "",
    profile_image: "",
    background_image: "",
    payment_info: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isProfileUploading, setIsProfileUploading] = useState(false);
  const [isBackgroundUploading, setIsBackgroundUploading] = useState(false);

  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsFetching(true);
        const profileData = await getInstructorProfile();
        setProfile(profileData);
        setFormData({
          instructor_name: profileData.instructor_name,
          instructor_description: profileData.instructor_description,
          profile_image: profileData.profile_image,
          background_image: profileData.background_image,
          payment_info: profileData.payment_info,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error(t("editProfile.messages.loadFailed"));
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, []);

  // Track changes
  useEffect(() => {
    if (profile) {
      const hasDataChanged =
        formData.instructor_name !== profile.instructor_name ||
        formData.instructor_description !== profile.instructor_description ||
        formData.profile_image !== profile.profile_image ||
        formData.background_image !== profile.background_image ||
        formData.payment_info !== profile.payment_info;

      setHasChanges(hasDataChanged);
    }
  }, [formData, profile]);

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

    if (!hasChanges) {
      toast.info(t("editProfile.messages.noChanges"));
      return;
    }

    setIsLoading(true);

    try {
      const updatedProfile = await updateInstructorProfile(formData);
      setProfile(updatedProfile);
      setHasChanges(false);
      toast.success(t("editProfile.messages.updateSuccess"));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("editProfile.messages.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        instructor_name: profile.instructor_name,
        instructor_description: profile.instructor_description,
        profile_image: profile.profile_image,
        background_image: profile.background_image,
        payment_info: profile.payment_info,
      });
      setHasChanges(false);
    }
  };

  const handleProfileImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("editProfile.messages.invalidImageFile"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("editProfile.messages.imageTooLarge"));
      return;
    }

    setIsProfileUploading(true);

    try {
      const response = await uploadInstructorProfileImage(file);
      if (response.success) {
        setFormData((prev) => ({ ...prev, profile_image: response.url }));
        toast.success(t("editProfile.messages.profileImageSuccess"));
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error(t("editProfile.messages.profileImageFailed"));
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
      toast.error(t("editProfile.messages.invalidImageFile"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("editProfile.messages.imageTooLarge"));
      return;
    }

    setIsBackgroundUploading(true);

    try {
      const response = await uploadInstructorProfileImage(file);
      if (response.success) {
        setFormData((prev) => ({ ...prev, background_image: response.url }));
        toast.success(t("editProfile.messages.backgroundImageSuccess"));
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading background image:", error);
      toast.error(t("editProfile.messages.backgroundImageFailed"));
    } finally {
      setIsBackgroundUploading(false);
      // Clear the file input
      if (backgroundFileInputRef.current) {
        backgroundFileInputRef.current.value = "";
      }
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="sticky top-0 z-20 bg-background flex items-center h-18 border-b w-full p-4">
          <h1 className="text-2xl font-bold">{t("editProfile.title")}</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-xs">{t("editProfile.loadingProfile")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Profile Banner - Always on top */}
      <div className="relative">
        {/* Custom Profile Banner for Edit Mode */}
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
              alt={t("editProfile.backgroundAlt", { name: formData.instructor_name })}
              className="h-full w-full object-cover"
            />

            {/* Upload Overlay for Background */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {isBackgroundUploading ? (
                <Loader2 className="size-8 text-white animate-spin" />
              ) : (
                <div className="text-center text-white">
                  <Upload className="size-8 mx-auto mb-2" />
                  <p className="text-xs">{t("editProfile.clickToUploadBackground")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Section with Avatar and Info side by side */}
          <div className="flex items-start px-6 -mb-4">
            {/* Left: Avatar Only (No Follow Button) */}
            <div className="flex flex-col items-center -mt-16">
              <div
                className="cursor-pointer relative group"
                onClick={() => profileFileInputRef.current?.click()}
              >
                <div className="h-32 w-32 border-2 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                  {formData.profile_image ? (
                    <img
                      src={formData.profile_image}
                      alt={formData.instructor_name}
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

            {/* Right: Profile Info */}
            <div className="ml-6 mt-4">
              <div className="flex items-center space-x-2">
                <h4 className="text-xl font-bold">
                  {formData.instructor_name || t("editProfile.instructorNameFallback")}
                </h4>
              </div>

              <p className="text-xs mt-1 line-clamp-3">
                {formData.instructor_description || t("editProfile.instructorDescriptionFallback")}
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
        <form id="edit-profile-form" onSubmit={handleSubmit} className="">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-3">
              <h2 className="font-semibold text-xs">{t("editProfile.basicInformation")}</h2>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="instructor_name" className="text-xs">
                    {t("editProfile.instructorName")}
                  </Label>
                  <Input
                    id="instructor_name"
                    name="instructor_name"
                    type="text"
                    value={formData.instructor_name}
                    onChange={handleInputChange}
                    placeholder={t("editProfile.namePlaceholder")}
                    className="mt-1 text-xs"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="instructor_description" className="text-xs">
                    {t("editProfile.description")}
                  </Label>
                  <Textarea
                    id="instructor_description"
                    name="instructor_description"
                    value={formData.instructor_description}
                    onChange={handleInputChange}
                    placeholder={t("editProfile.descriptionPlaceholder")}
                    className="mt-1 text-xs min-h-32 resize-none"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-3">
              <h2 className="font-semibold text-xs">{t("editProfile.paymentInformation")}</h2>

              <div>
                <Label htmlFor="payment_info" className="text-xs">
                  {t("editProfile.paymentDetails")}
                </Label>
                <Textarea
                  id="payment_info"
                  name="payment_info"
                  value={formData.payment_info}
                  onChange={handleInputChange}
                  placeholder={t("editProfile.paymentPlaceholder")}
                  className="mt-1 text-xs min-h-20 resize-none"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {hasChanges && (
              <div className="flex justify-end items-center space-x-6 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 text-xs"
                >
                  <X className="size-4 mr-1" />
                  {t("editProfile.reset")}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="h-8 text-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 mr-1 animate-spin" />
                      {t("editProfile.saving")}
                    </>
                  ) : (
                    <>
                      <Save className="size-4 mr-1" />
                      {t("editProfile.saveChanges")}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

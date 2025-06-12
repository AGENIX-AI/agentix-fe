import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import type { ComboboxOption } from "@/components/ui/combobox";
import { authService } from "@/services/auth";
import { motion } from "framer-motion";

interface WaitlistFormData {
  role: "instructor" | "student" | "corporate";
  division: string;
  schoolOrBusinessName: string;
}

interface WaitlistRequest {
  role: string;
  field: string;
  business: string;
}

const WaitlistForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const roleOptions: ComboboxOption[] = [
    { value: "student", label: "Student / Learner" },
    { value: "instructor", label: "Professor / Instructor" },
    { value: "both", label: "Both" },
  ];

  const [formData, setFormData] = useState<WaitlistFormData>({
    role: "student",
    division: "",
    schoolOrBusinessName: "",
  });

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as "instructor" | "student" | "corporate",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert form data to match the backend API's expected format
      const waitlistRequest: WaitlistRequest = {
        role: formData.role,
        field: formData.division,
        business: formData.schoolOrBusinessName,
      };

      // Submit waitlist information to the server using the auth service
      await authService.submitWaitlistForm(waitlistRequest);

      // Reload auth to update the user's status
      // await reloadAuth();

      // Redirect to the waitlist page
      navigate("/auth/waitlist");
    } catch (error) {
      console.error("Failed to submit waitlist form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-muted to-background p-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border border-muted">
          <CardHeader className="pb-0">
            <div className="flex justify-center mb-6">
              <img
                src="https://edvara-bucket.sgp1.cdn.digitaloceanspaces.com/public/Edvara-Full-Logo-Teal-1024-removebg-preview.png"
                alt="Edvara Logo"
                className="h-16 object-contain"
              />
            </div>
            <CardTitle className="text-center text-2xl font-bold text-primary">
              Complete Your Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-3">
                <div className="rounded-lg">
                  <Label
                    htmlFor="role"
                    className="text-sm font-semibold text-primary block mb-3"
                  >
                    I am a:
                  </Label>
                  <Combobox
                    options={roleOptions}
                    value={formData.role}
                    onValueChange={handleRoleChange}
                    placeholder="Select your role"
                    triggerClassName="border-input focus:border-primary focus:ring-primary/20 text-sm"
                    contentClassName="border-input"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="division"
                    className="text-sm font-medium text-primary block"
                  >
                    Division or Discipline
                  </Label>
                  <Input
                    id="division"
                    name="division"
                    value={formData.division}
                    onChange={handleInputChange}
                    className="border-input focus:border-primary focus:ring-primary/20 text-sm"
                    placeholder="e.g., Computer Science, Engineering, Marketing"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="schoolOrBusinessName"
                    className="text-sm font-medium text-primary block"
                  >
                    School or Business Name
                  </Label>
                  <Input
                    id="schoolOrBusinessName"
                    name="schoolOrBusinessName"
                    value={formData.schoolOrBusinessName}
                    onChange={handleInputChange}
                    className="border-input focus:border-primary focus:ring-primary/20 text-sm"
                    placeholder="Enter your school or business name"
                    required
                  />
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pt-4"
              >
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WaitlistForm;

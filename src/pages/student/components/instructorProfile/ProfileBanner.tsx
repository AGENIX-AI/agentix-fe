import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { ExtraSmall, H4 } from "@/components/ui/typography";
import { useTranslation } from "react-i18next";

interface ProfileBannerProps {
  instructorName?: string;
  profileImage?: string;
  backgroundImage?: string;
  instructorDescription?: string;
}

export function ProfileBanner({
  instructorName = "",
  profileImage = "",
  backgroundImage = "",
  instructorDescription = "",
}: ProfileBannerProps) {
  const { t } = useTranslation();
  return (
    <div className="relative pb-8 border-b">
      {/* Banner Image */}
      <div className="h-40 w-full overflow-hidden">
        <img
          src={
            backgroundImage ||
            "https://plus.unsplash.com/premium_photo-1701534008693-0eee0632d47a?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d2Vic2l0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
          }
          alt={`${instructorName}'s background`}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Profile Section with Avatar and Info side by side */}
      <div className="flex items-start px-6 -mb-4">
        {/* Left: Avatar and Follow Button */}
        <div className="flex flex-col items-center -mt-16">
          <Avatar className="h-32 w-32 border-2">
            <AvatarImage src={profileImage} alt={instructorName} />
            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
              {instructorName
                ?.split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2) || t("student.instructorProfile.instructorInitials")}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Right: Profile Info */}
        <div className="ml-6 mt-4">
          <div className="flex items-center space-x-2">
            <H4>{instructorName}</H4>
            {/* <BadgeCheck className="h-5 w-5 text-primary" /> */}
            {/* <Small className="text-muted-foreground">· 1st</Small> */}
          </div>

          <ExtraSmall className="mt-1 line-clamp-3">
            {instructorDescription}
          </ExtraSmall>
        </div>
      </div>
    </div>
  );
}

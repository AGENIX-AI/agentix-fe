import { BadgeCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ExtraSmall, H4, Small } from "@/components/ui/typography";

interface ProfileBannerProps {
  instructorName?: string;
  profileImage?: string;
  backgroundImage?: string;
  instructorDescription?: string;
}

export function ProfileBanner({
  instructorName = "Instructor",
  profileImage = "",
  backgroundImage = "",
  instructorDescription = "",
}: ProfileBannerProps) {
  return (
    <div className="relative pb-8 border-b">
      {/* Banner Image */}
      <div className="h-24 w-full overflow-hidden">
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
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={profileImage} alt={instructorName} />
            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
              {instructorName
                ?.split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2) || "IN"}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            className="rounded-full border-2 border-border text-foreground hover:bg-muted px-6 w-full"
          >
            <span className="font-bold">+</span>
            <Small className="ml-1">Follow</Small>
          </Button>
        </div>

        {/* Right: Profile Info */}
        <div className="ml-6 mt-4">
          <div className="flex items-center space-x-2">
            <H4>{instructorName}</H4>
            <BadgeCheck className="h-5 w-5 text-primary" />
            <Small className="text-muted-foreground">· 1st</Small>
          </div>

          <ExtraSmall className="mt-1 line-clamp-3">
            {instructorDescription}
          </ExtraSmall>
        </div>
      </div>
    </div>
  );
}

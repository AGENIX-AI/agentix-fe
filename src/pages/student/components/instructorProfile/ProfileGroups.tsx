import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { H6, ExtraSmall } from "@/components/ui/typography";
import { useTranslation } from "react-i18next";

export function ProfileGroups({
  instructorName,
}: {
  instructorName: string | undefined;
}) {
  const { t } = useTranslation();
  const hasGroups = false; // You can set this based on your actual data

  return (
    <div className="mt-6">
      <H6>{t("student.instructorProfile.instructorGroups", { name: instructorName })}</H6>

      {hasGroups ? (
        <div className="mt-3 space-y-6">
          <div className="flex items-start">
            <Avatar className="h-8 w-8 rounded-sm">
              <AvatarImage
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStjGalqaBDl6SkMcn-msr95hpHq79n02mkvw&s"
                alt="Harvard Business Review"
              />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                HBR
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 flex-1">
              <H6>{t("student.instructorProfile.harvardGroupName")}</H6>
              <ExtraSmall className="text-muted-foreground">
                {t("student.instructorProfile.memberCount", { count: 3000000 })}
              </ExtraSmall>
              <ExtraSmall className="text-muted-foreground mt-1 line-clamp-2">
                At Harvard Business Review, we believe in management. If the
                world's organizations and institutions were run more
                effectively, if our leaders made better decisions, if people
                worked more productively, we believe that ...
              </ExtraSmall>
            </div>
            <Button
              variant="outline"
              className="rounded-full border border-primary text-primary bg-background hover:bg-primary/10 px-6 py-1 h-8 ml-2"
            >
              <ExtraSmall>Join</ExtraSmall>
            </Button>
          </div>

          <div className="flex items-start">
            <Avatar className="h-8 w-8 rounded-sm">
              <AvatarImage
                src="https://cdn4.vectorstock.com/i/1000x1000/48/98/social-group-logo-vector-7124898.jpg"
                alt="Social Media Marketing"
              />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                SMM
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 flex-1">
              <H6>{t("student.instructorProfile.socialMediaGroupName")}</H6>
              <ExtraSmall className="text-muted-foreground">
                {t("student.instructorProfile.memberCount", { count: 3000000 })}
              </ExtraSmall>
              <ExtraSmall className="text-muted-foreground mt-1 line-clamp-2">
                This Social Media Marketing{" "}
                <span className="font-medium">group</span> is the largest
                LinkedIn <span className="font-medium">group</span> in the world
                focused on digital marketing and aims to help businesses of any
                size leverage social media...
              </ExtraSmall>
            </div>
            <Button
              variant="outline"
              className="rounded-full border border-primary text-primary bg-background hover:bg-primary/10 px-6 py-1 h-8 ml-2"
            >
              <ExtraSmall>Join</ExtraSmall>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center">
          <div className="h-16 w-16 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <ExtraSmall className="mt-2 text-muted-foreground">
            {instructorName} has not created any private groups
          </ExtraSmall>
        </div>
      )}
    </div>
  );
}

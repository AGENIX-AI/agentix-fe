import { H6, ExtraSmall } from "@/components/ui/typography";
import { Share } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";

interface PostProps {
  content: string;
}

function Post({ content }: PostProps) {
  return (
    <div>
      <div className="flex items-start">
        <Avatar className="h-8 w-8 mt-3">
          <AvatarImage
            src="https://scontent.fsgn13-2.fna.fbcdn.net/v/t1.15752-9/485991860_1162000361785304_2336636677620737836_n.png?stp=dst-png_s480x480&_nc_cat=108&ccb=1-7&_nc_sid=0024fc&_nc_eui2=AeHFa4lu9cPVzsEUTT8vrr1YhP67Wr0MRu6E_rtavQxG7hsVKfP4CR5IBuWs-3_m0Fs0yfTsghFzYAs6udADaI5m&_nc_ohc=hCQ527mj_KIQ7kNvgHlepn_&_nc_oc=AdngtdBt1LFY0YppRFp_e_REvYAexs8eElZk9FpRpEWiKXeI6K3duf3BPKV3Wwmp_90&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.fsgn13-2.fna&oh=03_Q7cD1wHjiOFUYlWPUAECzrElCAKP_FcaickmKa7BV8IwHpqPRQ&oe=680D845C"
            alt="Son Tran"
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            ST
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <div className="flex items-center">
            <ExtraSmall>Son Tran</ExtraSmall>
            <ExtraSmall className="ml-2 text-muted-foreground">
              · 1st
            </ExtraSmall>
          </div>
          <ExtraSmall className="text-muted-foreground">
            Entrepreneurship Evangelist and Educator
          </ExtraSmall>
          <ExtraSmall className="text-muted-foreground">
            3w ·{" "}
            <span className="rounded-full bg-muted p-0.5 inline-flex items-center justify-center h-4 w-4">
              <Share className="h-2.5 w-2.5" />
            </span>
          </ExtraSmall>
        </div>
      </div>
      <div className="mt-2">
        <ExtraSmall>{content}</ExtraSmall>
      </div>
    </div>
  );
}

interface ProfilePostsProps {
  instructorDescription?: string;
  instructorName?: string;
}

export function ProfilePosts({
  instructorDescription,
  instructorName,
}: ProfilePostsProps) {
  const hasPosts = false; // Show posts section if there's a description

  return (
    <div className="mt-6">
      <H6>{instructorName} Posts</H6>

      {hasPosts ? (
        <div className="mt-3 space-y-4">
          <Post content={instructorDescription || ""} />
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
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
            </svg>
          </div>
          <ExtraSmall className="mt-2 text-muted-foreground">
            No posts available
          </ExtraSmall>
        </div>
      )}
    </div>
  );
}

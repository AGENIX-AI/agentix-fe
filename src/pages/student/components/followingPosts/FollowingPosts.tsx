import {
  Bookmark,
  CheckCircle,
  MessageCircle,
  Share,
  ThumbsUp,
  Loader2,
  FileText,
  ExternalLink,
  Download,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { memo, useEffect, useRef, useState } from "react";
import { H7, ExtraSmall } from "@/components/ui/typography";

interface PostType {
  id: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
    role?: string;
    verified?: boolean;
  };
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  video?: {
    title: string;
    subtitle: string;
    description: string;
    sources: string[];
    thumb: string;
  };
  documentUrl?: string;
  document?: {
    title: string;
    description?: string;
    url: string;
    type: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  tags?: string[];
  topComment?: {
    author: {
      name: string;
      avatarUrl: string;
    };
    content: string;
  };
}

interface ProfileInfo {
  id: string;
  name: string;
  avatarUrl: string;
  role?: string;
}

interface FollowingPostsProps {
  onSelectProfileInfo?: (profileInfo: ProfileInfo) => void;
  showMoreData?: boolean;
}

interface PostProps {
  post: PostType;
  onSelectProfileInfo?: (profileInfo: ProfileInfo) => void;
  showMoreData?: boolean;
}
const Post = memo(
  ({ post, onSelectProfileInfo, showMoreData = false }: PostProps) => {
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    return (
      <div className="p-4 border rounded-lg ">
        <div className="flex items-center mb-3">
          <Avatar className="h-10 w-10 mr-3 cursor-pointer">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <H7 className="font-semibold cursor-pointer hover:underline">
                {post.author.name}
              </H7>
              {post.author.verified && <CheckCircle className="h-4 w-4 ml-1" />}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ExtraSmall>
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </ExtraSmall>
              {post.author.role && (
                <>
                  <ExtraSmall className="mx-1">•</ExtraSmall>
                  <ExtraSmall className="text-xs py-0 h-4">
                    {post.author.role}
                  </ExtraSmall>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <ExtraSmall>{post.content}</ExtraSmall>

          {post.imageUrl && (
            <div className="mt-3 rounded-md overflow-hidden">
              <img
                src={post.imageUrl}
                alt="Post image"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {(post.videoUrl || post.video) && (
            <div className="mt-3 rounded-md overflow-hidden">
              {post.video && (
                <div className="mb-2">
                  <H7 className="font-medium">{post.video.title}</H7>
                  <ExtraSmall className="text-muted-foreground">
                    {post.video.subtitle}
                  </ExtraSmall>
                </div>
              )}
              <video
                src={post.video?.sources?.[0] || post.videoUrl}
                poster={post.video?.thumb}
                controls
                className="w-full h-auto rounded-md"
                preload="metadata"
              />
              {post.video?.description && (
                <ExtraSmall className="mt-2 text-muted-foreground">
                  {post.video.description}
                </ExtraSmall>
              )}
            </div>
          )}

          {(post.documentUrl || post.document) && (
            <div className="mt-3 border rounded-md overflow-hidden">
              <div className="p-4 bg-muted/30 flex items-start gap-3">
                <div className="text-primary">
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <H7 className="font-medium truncate">
                    {post.document?.title || "Document"}
                  </H7>
                  {post.document?.description && (
                    <ExtraSmall className="text-muted-foreground mt-1">
                      {post.document.description}
                    </ExtraSmall>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setShowPdfPreview(!showPdfPreview)}
                      className="text-xs flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                    >
                      {showPdfPreview ? "Hide Preview" : "View Preview"}
                    </button>
                    <a
                      href={post.document?.url || post.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded-md transition-colors"
                    >
                      <ExternalLink size={12} />
                      Open
                    </a>
                    <a
                      href={post.document?.url || post.documentUrl}
                      download
                      className="text-xs flex items-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded-md transition-colors"
                    >
                      <Download size={12} />
                      Download
                    </a>
                  </div>
                </div>
              </div>
              {showPdfPreview && (
                <div className="h-[500px] border-t">
                  <iframe
                    src={`${post.document?.url || post.documentUrl}#toolbar=0`}
                    className="w-full h-full"
                    title={post.document?.title || "Document preview"}
                  />
                </div>
              )}
            </div>
          )}

          {showMoreData && post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.tags.map((tag, index) => (
                <ExtraSmall
                  key={index}
                  className="text-xs py-0 h-4 bg-muted/30 rounded-md px-2"
                >
                  {tag}
                </ExtraSmall>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center space-x-4">
              <button className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ThumbsUp className="h-4 w-4 mr-1" />
                <ExtraSmall>{post.likes}</ExtraSmall>
              </button>
              <button className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                <MessageCircle className="h-4 w-4 mr-1" />
                <ExtraSmall>{post.comments}</ExtraSmall>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-muted-foreground hover:text-foreground">
                <Share className="h-4 w-4" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground">
                <Bookmark className="h-4 w-4" />
              </button>
            </div>
          </div>

          {post.topComment && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-start">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage
                    src={post.topComment.author.avatarUrl}
                    alt={post.topComment.author.name}
                  />
                  <AvatarFallback>
                    {post.topComment.author.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <ExtraSmall className="font-medium">
                    {post.topComment.author.name}
                  </ExtraSmall>
                  <ExtraSmall className="mt-1">
                    {post.topComment.content}
                  </ExtraSmall>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export function FollowingPosts({ showMoreData = false }: FollowingPostsProps) {
  const [visiblePosts, setVisiblePosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const postsPerPage = 5;

  // Function to load more posts
  const loadMorePosts = () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simulate API call with setTimeout
    setTimeout(() => {
      const startIndex = (page - 1) * postsPerPage;
      const endIndex = page * postsPerPage;
      const newPosts = followingPosts.slice(startIndex, endIndex);

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setVisiblePosts((prev) => [...prev, ...newPosts]);
        setPage((prev) => prev + 1);
      }

      setIsLoading(false);
    }, 500); // Simulate network delay
  };

  // Initialize with first batch of posts
  useEffect(() => {
    loadMorePosts();
  }, []);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, isLoading]);

  const hasPosts = visiblePosts.length > 0;

  return (
    <div className="p-2">
      {hasPosts ? (
        <>
          <div className="space-y-4">
            {visiblePosts.map((post, index) => (
              <Post
                key={`${post.id}-${index}`}
                post={post}
                showMoreData={showMoreData}
              />
            ))}
          </div>

          {/* Loading indicator and intersection observer target */}
          <div ref={loaderRef} className="py-4 flex justify-center">
            {isLoading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <ExtraSmall className="text-muted-foreground">
                  Loading more posts...
                </ExtraSmall>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center">
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
            No posts from people you follow
          </ExtraSmall>
        </div>
      )}
    </div>
  );
}

const followingPosts: PostType[] = [
  {
    id: "post-doc1",
    author: {
      id: "user8",
      name: "Aisha Patel",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Aisha+Patel&background=random",
      role: "Education Specialist",
      verified: true,
    },
    content:
      "I've just uploaded a sample PDF document for our upcoming workshop. Please review it before our session next week!",
    document: {
      title: "Sample PDF Document",
      description: "A basic sample PDF file for demonstration purposes",
      url: "https://www.aeee.in/wp-content/uploads/2020/08/Sample-pdf.pdf",
      type: "application/pdf",
    },
    createdAt: "2025-04-27T08:15:00Z",
    likes: 24,
    comments: 5,
    tags: ["Education", "Workshop", "Document"],
    topComment: {
      author: {
        name: "Thomas Lee",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Thomas+Lee&background=random",
      },
      content:
        "Thanks for sharing this! Will definitely review it before the workshop.",
    },
  },
  {
    id: "post-doc2",
    author: {
      id: "user9",
      name: "Daniel Wright",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Daniel+Wright&background=random",
      role: "Technical Documentation Specialist",
      verified: false,
    },
    content:
      "Here's a technical document showing basic link functionality in PDF format. This demonstrates how interactive PDFs can enhance learning experiences.",
    document: {
      title: "Basic Link Sample PDF",
      description: "A technical PDF showing link functionality and formatting",
      url: "https://www.antennahouse.com/hubfs/xsl-fo-sample/pdf/basic-link-1.pdf",
      type: "application/pdf",
    },
    createdAt: "2025-04-26T14:45:00Z",
    likes: 37,
    comments: 8,
    tags: ["Technical", "Documentation", "PDF", "Interactive"],
    topComment: {
      author: {
        name: "Rachel Kim",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Rachel+Kim&background=random",
      },
      content:
        "This is really helpful for understanding how to create better interactive documents. Thanks!",
    },
  },
  {
    id: "post-0",
    author: {
      id: "user5",
      name: "Alex Thompson",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Alex+Thompson&background=random",
      role: "Video Content Creator",
      verified: true,
    },
    content:
      "Just finished this amazing educational video about design thinking! Check it out and let me know what you think in the comments.",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    video: {
      title: "Big Buck Bunny",
      subtitle: "By Blender Foundation",
      description:
        "Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself. When one sunny day three rodents rudely harass him, something snaps... and the rabbit ain't no bunny anymore! In the typical cartoon tradition he prepares the nasty rodents a comical revenge.",
      sources: [
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      ],
      thumb:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    },
    createdAt: "2025-04-27T10:30:00Z",
    likes: 89,
    comments: 15,
    tags: ["Education", "Design", "Video", "Learning"],
    topComment: {
      author: {
        name: "Lisa Wang",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Lisa+Wang&background=random",
      },
      content:
        "This is exactly what I needed for my upcoming project! Thanks for sharing!",
    },
  },
  {
    id: "post-1",
    author: {
      id: "user1",
      name: "Son Tran",
      avatarUrl: "https://ui-avatars.com/api/?name=Son+Tran&background=random",
      role: "Entrepreneurship Evangelist and Educator",
      verified: true,
    },
    content:
      "I am thrilled to receive an invitation from Professor Bill Aulet of MIT to sign up for D-eship. His Disciplined Entrepreneurship shaped me into the entrepreneurship teacher-educator I am today. His lectures are intense yet incredibly engaging and fun.",
    createdAt: "2025-04-06T14:30:00Z",
    likes: 42,
    comments: 7,
    tags: ["AI", "Healthcare", "Research", "DeepLearning"],
    topComment: {
      author: {
        name: "Michael Johnson",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Michael+Johnson&background=random",
      },
      content:
        "Fascinating work! I'd love to discuss potential applications in preventative care.",
    },
  },
  {
    id: "post-2",
    author: {
      id: "user2",
      name: "Maria Chen",
      avatarUrl: "https://picsum.photos/200",
      role: "AI Research Scientist",
      verified: false,
    },
    content:
      "Just published my latest research on neural networks for natural language processing. Excited to share the findings with the community and get your feedback!",
    imageUrl:
      "https://cdn.vietnambiz.vn/2020/4/8/neuron-1586326268991830979556.jpeg",
    createdAt: "2025-04-07T09:15:00Z",
    likes: 28,
    comments: 5,
    tags: ["NLP", "MachineLearning", "Transformers"],
    topComment: {
      author: {
        name: "Sarah Williams",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Sarah+Williams&background=random",
      },
      content:
        "Have you tried fine-tuning with domain-specific data? I found it significantly improves performance.",
    },
  },
  {
    id: "post-3",
    author: {
      id: "user3",
      name: "David Kim",
      avatarUrl: "https://ui-avatars.com/api/?name=David+Kim&background=random",
      role: "Data Science Instructor",
      verified: true,
    },
    content:
      "Today's workshop on data visualization was a huge success! Thanks to everyone who participated. The recording will be available next week for those who missed it.",
    createdAt: "2025-04-05T16:45:00Z",
    likes: 76,
    comments: 12,
    tags: ["Conference", "ReinforcementLearning", "Robotics", "Speaking"],
    topComment: {
      author: {
        name: "David Kim",
        avatarUrl:
          "https://ui-avatars.com/api/?name=David+Kim&background=random",
      },
      content:
        "Looking forward to your talk! Will it be recorded for those who can't attend in person?",
    },
  },
  {
    id: "post-4",
    author: {
      id: "user4",
      name: "Emily Carter",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Emily+Carter&background=random",
      role: "AI Ethics Consultant",
      verified: true,
    },
    content:
      "Just finished a fascinating panel discussion on the ethical implications of AI in criminal justice. So many important considerations for developers and policymakers!",
    createdAt: "2025-04-08T11:00:00Z",
    likes: 55,
    comments: 8,
    tags: ["Ethics", "AI", "Law", "Justice"],
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    video: {
      title: "Elephant Dream",
      subtitle: "By Blender Foundation",
      description: "The first Blender Open Movie from 2006",
      sources: [
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      ],
      thumb:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    },
    topComment: {
      author: {
        name: "Robert Lee",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Robert+Lee&background=random",
      },
      content:
        "Great to see these conversations happening! It's crucial we address bias in algorithms.",
    },
  },
  {
    id: "post-5",
    author: {
      id: "user5",
      name: "Kenji Tanaka",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Kenji+Tanaka&background=random",
      role: "Tech Evangelist",
      verified: false,
    },
    content:
      "Check out this amazing demo of Chromecast capabilities! Perfect for when you want to enjoy online content on your TV.",
    video: {
      title: "For Bigger Blazes",
      subtitle: "By Google",
      description:
        "HBO GO now works with Chromecast -- the easiest way to enjoy online video on your TV. For when you want to settle into your Iron Throne to watch the latest episodes. For $35.\nLearn how to use Chromecast with HBO GO and more at google.com/chromecast.",
      sources: [
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      ],
      thumb:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
    },
    createdAt: "2025-04-04T13:20:00Z",
    likes: 32,
    comments: 4,
    tags: ["Technology", "Streaming", "Chromecast"],
    topComment: {
      author: {
        name: "James Wilson",
        avatarUrl:
          "https://ui-avatars.com/api/?name=James+Wilson&background=random",
      },
      content:
        "This is a game-changer for home entertainment! Thanks for sharing.",
    },
  },
  {
    id: "post-6",
    author: {
      id: "user6",
      name: "Sophia Rodriguez",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Sophia+Rodriguez&background=random",
      role: "Digital Media Specialist",
      verified: true,
    },
    content:
      "Exploring new ways to enjoy content on bigger screens. The future of entertainment is here!",
    video: {
      title: "For Bigger Escape",
      subtitle: "By Google",
      description:
        "Introducing Chromecast. The easiest way to enjoy online video and music on your TV—for when Batman's escapes aren't quite big enough. For $35. Learn how to use Chromecast with Google Play Movies and more at google.com/chromecast.",
      sources: [
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      ],
      thumb:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
    },
    createdAt: "2025-04-03T09:45:00Z",
    likes: 47,
    comments: 6,
    tags: ["Entertainment", "Technology", "Streaming"],
    topComment: {
      author: {
        name: "Emma Chen",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Emma+Chen&background=random",
      },
      content:
        "I've been using this for a month now and it's completely changed how I watch movies!",
    },
  },
  {
    id: "post-7",
    author: {
      id: "user7",
      name: "Marcus Johnson",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Marcus+Johnson&background=random",
      role: "Product Reviewer",
      verified: false,
    },
    content:
      "Looking for ways to make your entertainment setup more fun? Here's my latest review of an amazing product!",
    video: {
      title: "For Bigger Fun",
      subtitle: "By Google",
      description:
        "Introducing Chromecast. The easiest way to enjoy online video and music on your TV. For $35. Find out more at google.com/chromecast.",
      sources: [
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      ],
      thumb:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg",
    },
    createdAt: "2025-04-02T15:10:00Z",
    likes: 63,
    comments: 9,
    tags: ["Review", "Technology", "Entertainment"],
    topComment: {
      author: {
        name: "Olivia Park",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Olivia+Park&background=random",
      },
      content:
        "Just ordered one based on your recommendation. Can't wait to try it out!",
    },
  },
  {
    id: "post-8",
    author: {
      id: "user8",
      name: "Isabella Rossi",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Isabella+Rossi&background=random",
      role: "AI Product Manager",
      verified: true,
    },
    content:
      "We're hiring AI/ML engineers for our exciting new project!  Join a dynamic team and help us build the future of AI-powered solutions.",
    createdAt: "2025-04-05T10:30:00Z",
    likes: 81,
    comments: 18,
    tags: ["Hiring", "AI", "ML", "Jobs"],
    topComment: {
      author: {
        name: "Jonathan Smith",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Jonathan+Smith&background=random",
      },
      content: "What specific skills are you looking for in candidates?",
    },
  },
];

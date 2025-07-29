import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Loader2, Check, ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCrawlUrls, indexUrls } from "@/api/documents";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AddWebDerivedKnowledgeSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  metaData: any;
  setMetaData: (metaData: any) => void;
}

interface CrawlUrl {
  url: string;
  depth: number;
  selected: boolean;
}

type UrlsByDepth = Record<number, CrawlUrl[]>;

export function AddWebDerivedKnowledgeSidebar({
  isVisible,
  onClose,
  onSuccess,
  metaData,
  setMetaData,
}: AddWebDerivedKnowledgeSidebarProps) {
  const [step, setStep] = useState<"fetch" | "select">("fetch");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch step form data
  const [url, setUrl] = useState("");
  const [depth, setDepth] = useState<number>(0);

  // Select step form data
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("English");
  const [crawlUrls, setCrawlUrls] = useState<CrawlUrl[]>([]);
  const [urlsByDepth, setUrlsByDepth] = useState<UrlsByDepth>({});
  const [expandedDepths, setExpandedDepths] = useState<Record<number, boolean>>(
    {}
  );

  // Reset form when sidebar is closed
  useEffect(() => {
    if (!isVisible) {
      setStep("fetch");
      setUrl("");
      setDepth(0);
      setTitle("");
      setLanguage("English");
      setCrawlUrls([]);
      setUrlsByDepth({});
      setExpandedDepths({});
    }
  }, [isVisible]);

  // Group URLs by depth when crawlUrls changes
  useEffect(() => {
    const grouped: UrlsByDepth = {};

    crawlUrls.forEach((url) => {
      if (!grouped[url.depth]) {
        grouped[url.depth] = [];
      }
      grouped[url.depth].push(url);
    });

    setUrlsByDepth(grouped);

    // Initialize all depths as expanded by default
    const initialExpandedState: Record<number, boolean> = {};
    Object.keys(grouped).forEach((depth) => {
      initialExpandedState[Number(depth)] = true;
    });
    setExpandedDepths(initialExpandedState);
  }, [crawlUrls]);

  const toggleDepthExpansion = (depthLevel: number) => {
    setExpandedDepths((prev) => ({
      ...prev,
      [depthLevel]: !prev[depthLevel],
    }));
  };

  const handleFetchUrls = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await getCrawlUrls(url, depth);

      if (response.success) {
        // Add selected property to each URL
        const urlsWithSelection = response.data.map((item) => ({
          ...item,
          selected: true, // Default all URLs to selected
        }));

        setCrawlUrls(urlsWithSelection);
        setTitle(new URL(url).hostname); // Set default title to domain name
        setStep("select");
      } else {
        toast.error("Failed to fetch URLs");
      }
    } catch (error) {
      console.error("Error fetching URLs:", error);
      toast.error("Failed to fetch URLs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUrl = (toggledUrl: string) => {
    setCrawlUrls((prevUrls) =>
      prevUrls.map((item) =>
        item.url === toggledUrl ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleToggleDepth = (depthLevel: number, selected: boolean) => {
    setCrawlUrls((prevUrls) =>
      prevUrls.map((item) =>
        item.depth === depthLevel ? { ...item, selected } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get selected URLs
      const selectedUrls = crawlUrls
        .filter((item) => item.selected)
        .map((item) => item.url);

      if (selectedUrls.length === 0) {
        toast.error("Please select at least one URL to index");
        setIsSubmitting(false);
        return;
      }

      // Call the API to index URLs
      const response = await indexUrls({
        title,
        language,
        urls: selectedUrls,
      });

      if (response.success) {
        // Update metadata with the new document ID
        setMetaData({
          ...metaData,
          currentWebDerivedKnowledgeId: response.document_id,
        });

        toast.success("Online sources indexing started");
        // Call success callback
        onSuccess();
      } else {
        toast.error("Failed to index URLs");
      }
    } catch (error) {
      console.error("Error indexing URLs:", error);
      toast.error("Failed to index URLs");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedCountForDepth = (depthLevel: number): string => {
    if (!urlsByDepth[depthLevel]) return "0/0";

    const total = urlsByDepth[depthLevel].length;
    const selected = urlsByDepth[depthLevel].filter(
      (url) => url.selected
    ).length;

    return `${selected}/${total}`;
  };

  const isDepthFullySelected = (depthLevel: number): boolean => {
    if (!urlsByDepth[depthLevel]) return false;
    return urlsByDepth[depthLevel].every((url) => url.selected);
  };

  const isDepthPartiallySelected = (depthLevel: number): boolean => {
    if (!urlsByDepth[depthLevel]) return false;
    const selectedCount = urlsByDepth[depthLevel].filter(
      (url) => url.selected
    ).length;
    return selectedCount > 0 && selectedCount < urlsByDepth[depthLevel].length;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 md:w-[450px] bg-background border-l border-border shadow-lg z-50 overflow-hidden flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">
          {step === "fetch" ? "Add Online Sources" : "Select URLs to Index"}
        </h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto">
        {step === "fetch" ? (
          <form onSubmit={handleFetchUrls} className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="url" className="text-xs font-medium">
                  URL to Crawl
                </Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g., https://www.example.com"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Crawl Depth</Label>
                <RadioGroup
                  value={depth.toString()}
                  onValueChange={(value) => setDepth(parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="0"
                      id="depth-0"
                      className="h-3 w-3"
                    />
                    <Label htmlFor="depth-0" className="text-xs">
                      Current Page
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="1"
                      id="depth-1"
                      className="h-3 w-3"
                    />
                    <Label htmlFor="depth-1" className="text-xs">
                      Depth 1
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="title" className="text-xs font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for this collection"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="language" className="text-xs font-medium">
                  Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-3" />

              <div className="space-y-3">
                <Label className="text-xs font-medium">
                  Available URLs ({crawlUrls.filter((u) => u.selected).length}/
                  {crawlUrls.length} selected)
                </Label>
                <ScrollArea className="h-[400px] pr-2">
                  <div className="space-y-3">
                    {Object.keys(urlsByDepth)
                      .map(Number)
                      .sort((a, b) => a - b)
                      .map((depthLevel) => (
                        <div key={depthLevel} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div
                              className="flex items-center space-x-2 flex-1 cursor-pointer"
                              onClick={() =>
                                handleToggleDepth(
                                  depthLevel,
                                  !isDepthFullySelected(depthLevel)
                                )
                              }
                            >
                              <div
                                className={`w-4 h-4 flex items-center justify-center rounded border ${
                                  isDepthFullySelected(depthLevel)
                                    ? "bg-primary border-primary"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                {isDepthFullySelected(depthLevel) && (
                                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                )}
                                {isDepthPartiallySelected(depthLevel) && (
                                  <div className="w-2 h-2 bg-primary rounded-sm" />
                                )}
                              </div>
                              <span className="font-medium text-xs">
                                Depth {depthLevel}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">
                                {getSelectedCountForDepth(depthLevel)}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDepthExpansion(depthLevel);
                                }}
                                className="p-0.5 hover:bg-muted rounded"
                              >
                                {expandedDepths[depthLevel] ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                          {expandedDepths[depthLevel] && (
                            <div className="pl-6 space-y-2">
                              {urlsByDepth[depthLevel].map((item) => (
                                <div
                                  key={item.url}
                                  className="flex items-start space-x-2 cursor-pointer"
                                  onClick={() => handleToggleUrl(item.url)}
                                >
                                  <div
                                    className={`w-3.5 h-3.5 mt-0.5 flex items-center justify-center rounded border ${
                                      item.selected
                                        ? "bg-primary border-primary"
                                        : "border-gray-300 dark:border-gray-600"
                                    }`}
                                  >
                                    {item.selected && (
                                      <Check className="h-2 w-2 text-primary-foreground" />
                                    )}
                                  </div>
                                  <span className="text-xs break-all leading-tight">
                                    {item.url}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {step === "fetch" ? (
          <Button
            type="submit"
            className="w-full h-9 text-xs"
            disabled={isLoading}
            onClick={handleFetchUrls}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Fetching URLs...
              </>
            ) : (
              "Fetch URLs"
            )}
          </Button>
        ) : (
          <div className="w-full flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setStep("fetch")}
              disabled={isSubmitting}
              className="flex-1 h-9 text-xs"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 h-9 text-xs"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Indexing...
                </>
              ) : (
                "Index URLs"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

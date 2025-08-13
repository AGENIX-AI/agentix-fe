import { useState, useEffect } from "react";
import type { Assistant } from "@/api/assistants/index";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Search,
  FileText,
  BookOpen,
  Image,
  Globe,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  linkDocument,
  unlinkDocument,
  getOwnDocuments,
  getAssistantDocuments,
} from "@/api/documents";
import type { Document } from "@/api/documents";

interface AssistantKnowledgeProps {
  assistant: Assistant;
}

type DocumentType =
  | "upload_document"
  | "topic_knowledge"
  | "crawl_document"
  | "image";

interface TableSection {
  type: DocumentType;
  titleKey: string;
  icon: React.ReactNode;
  searchKey: string;
  addKey: string;
  noFoundKey: string;
  noAvailableKey: string;
}

const tableSections: TableSection[] = [
  {
    type: "upload_document",
    titleKey: "documents.assistantKnowledge.documents_tab",
    icon: <FileText className="h-4 w-4" />,
    searchKey: "documents.assistantKnowledge.search_documents",
    addKey: "documents.assistantKnowledge.add_document",
    noFoundKey: "documents.assistantKnowledge.no_documents_found",
    noAvailableKey: "documents.assistantKnowledge.no_documents_available",
  },
  {
    type: "topic_knowledge",
    titleKey: "documents.assistantKnowledge.notes_tab",
    icon: <BookOpen className="h-4 w-4" />,
    searchKey: "documents.assistantKnowledge.search_notes",
    addKey: "documents.assistantKnowledge.add_note",
    noFoundKey: "documents.assistantKnowledge.no_notes_found",
    noAvailableKey: "documents.assistantKnowledge.no_notes_available",
  },
  {
    type: "image",
    titleKey: "documents.assistantKnowledge.media_tab",
    icon: <Image className="h-4 w-4" />,
    searchKey: "documents.assistantKnowledge.search_media",
    addKey: "documents.assistantKnowledge.add_media",
    noFoundKey: "documents.assistantKnowledge.no_media_found",
    noAvailableKey: "documents.assistantKnowledge.no_media_available",
  },
  {
    type: "crawl_document",
    titleKey: "documents.assistantKnowledge.online_resources_tab",
    icon: <Globe className="h-4 w-4" />,
    searchKey: "documents.assistantKnowledge.search_online_resources",
    addKey: "documents.assistantKnowledge.add_online_resource",
    noFoundKey: "documents.assistantKnowledge.no_online_resources_found",
    noAvailableKey:
      "documents.assistantKnowledge.no_online_resources_available",
  },
];

export function AssistantKnowledge({ assistant }: AssistantKnowledgeProps) {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Record<DocumentType, Document[]>>({
    upload_document: [],
    image: [],
    topic_knowledge: [],
    crawl_document: [],
  });
  const [loading, setLoading] = useState<Record<DocumentType, boolean>>({
    upload_document: false,
    image: false,
    topic_knowledge: false,
    crawl_document: false,
  });
  const [searchQueries, setSearchQueries] = useState<
    Record<DocumentType, string>
  >({
    upload_document: "",
    image: "",
    topic_knowledge: "",
    crawl_document: "",
  });
  const [pageNumbers, setPageNumbers] = useState<Record<DocumentType, number>>({
    upload_document: 1,
    image: 1,
    topic_knowledge: 1,
    crawl_document: 1,
  });
  const [totalItems, setTotalItems] = useState<Record<DocumentType, number>>({
    upload_document: 0,
    image: 0,
    topic_knowledge: 0,
    crawl_document: 0,
  });

  // Sidebar state
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarType, setSidebarType] = useState<DocumentType | null>(null);
  const [availableDocuments, setAvailableDocuments] = useState<Document[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
  const [sidebarPageNumber, setSidebarPageNumber] = useState(1);
  const [sidebarTotalItems, setSidebarTotalItems] = useState(0);
  const [linkingDocumentIds, setLinkingDocumentIds] = useState<string[]>([]);
  const [unlinkingDocumentIds, setUnlinkingDocumentIds] = useState<string[]>(
    []
  );

  const pageSize = 10;

  const fetchDocuments = async (type: DocumentType) => {
    if (!assistant?.id) return;

    setLoading((prev) => ({ ...prev, [type]: true }));

    try {
      const response = await getAssistantDocuments(assistant.id, {
        search: searchQueries[type],
        type: type,
        page_number: pageNumbers[type],
        page_size: pageSize,
        sort_order: 1,
        sort_by: "created_at",
      });

      if (response.success) {
        setDocuments((prev) => ({ ...prev, [type]: response.documents }));
        setTotalItems((prev) => ({
          ...prev,
          [type]: response.total_items,
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${type} documents:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const fetchAvailableDocuments = async (
    type: DocumentType,
    is_link?: boolean
  ) => {
    if (!assistant?.id || !type) return;

    setSidebarLoading(true);

    try {
      const response = await getOwnDocuments({
        type,
        page_number: sidebarPageNumber,
        page_size: pageSize,
        search: sidebarSearchQuery,
        sort_by: "created_at",
        sort_order: 1,
        assistant_id: assistant.id,
      });

      if (response.success) {
        // Check linked status and handle link/unlink based on is_link parameter
        const documentsWithLinkAction = response.documents.map(
          (doc: Document) => {
            if (typeof is_link === "boolean") {
              // If is_link is true and document is not linked, it can be linked
              // If is_link is false and document is linked, it can be unlinked
              const canLink = is_link && !doc.linked;
              const canUnlink = !is_link && doc.linked;

              return {
                ...doc,
                canLink,
                canUnlink,
                actionType: canLink ? "link" : canUnlink ? "unlink" : "none",
              };
            }

            // Default behavior: show link action for unlinked documents
            return {
              ...doc,
              canLink: !doc.linked,
              canUnlink: doc.linked,
              actionType: doc.linked ? "unlink" : "link",
            };
          }
        );

        setAvailableDocuments(documentsWithLinkAction);
        setSidebarTotalItems(response.total_items);
      }
    } catch (error) {
      console.error(`Error fetching available ${type} documents:`, error);
      toast.error(t("documents.assistantKnowledge.failedToLoad"));
    } finally {
      setSidebarLoading(false);
    }
  };

  // Fetch all document types on mount and when assistant changes
  useEffect(() => {
    tableSections.forEach((section) => {
      fetchDocuments(section.type);
    });
  }, [assistant?.id]);

  // Refetch when search or page changes
  useEffect(() => {
    tableSections.forEach((section) => {
      fetchDocuments(section.type);
    });
  }, [searchQueries, pageNumbers]);

  // Fetch available documents when sidebar opens or search/page changes
  useEffect(() => {
    if (showSidebar && sidebarType) {
      // Default behavior: show all documents with appropriate link/unlink actions
      fetchAvailableDocuments(sidebarType);
    }
  }, [showSidebar, sidebarType, sidebarSearchQuery, sidebarPageNumber]);

  const handleSearchChange = (type: DocumentType, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [type]: value }));
    setPageNumbers((prev) => ({ ...prev, [type]: 1 })); // Reset to first page
  };

  const handlePageChange = (type: DocumentType, page: number) => {
    setPageNumbers((prev) => ({ ...prev, [type]: page }));
  };

  const handleAddClick = (type: DocumentType) => {
    setSidebarType(type);
    setSidebarSearchQuery("");
    setSidebarPageNumber(1);
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    setSidebarType(null);
    setAvailableDocuments([]);
    setSidebarSearchQuery("");
    setSidebarPageNumber(1);
  };

  const handleLinkDocument = async (documentId: string, type: DocumentType) => {
    if (!assistant?.id) return;

    setLinkingDocumentIds((prev) => [...prev, documentId]);

    try {
      const response = await linkDocument(documentId, assistant.id);
      if (response.success) {
        const typeName = getTypeName(type);
        toast.success(
          t("documents.assistantKnowledge.document_linked", { type: typeName })
        );

        // Refresh the main documents list
        fetchDocuments(type);

        // Refresh the available documents list
        fetchAvailableDocuments(type);
      } else {
        const typeName = getTypeName(type);
        toast.error(
          t("documents.assistantKnowledge.failed_to_link", { type: typeName })
        );
      }
    } catch (error) {
      console.error("Error linking document:", error);
      const typeName = getTypeName(type);
      toast.error(
        t("documents.assistantKnowledge.failed_to_link", { type: typeName })
      );
    } finally {
      setLinkingDocumentIds((prev) => prev.filter((id) => id !== documentId));
    }
  };

  const handleUnlinkDocument = async (
    documentId: string,
    type: DocumentType
  ) => {
    if (!assistant?.id) return;

    setUnlinkingDocumentIds((prev) => [...prev, documentId]);

    try {
      const response = await unlinkDocument(documentId, assistant.id);
      if (response.success) {
        const typeName = getTypeName(type);
        toast.success(
          t("documents.assistantKnowledge.document_unlinked", {
            type: typeName,
          })
        );

        // Refresh the main documents list
        fetchDocuments(type);

        // Refresh the sidebar documents if sidebar is open
        if (showSidebar && sidebarType === type) {
          fetchAvailableDocuments(type);
        }
      } else {
        const typeName = getTypeName(type);
        toast.error(
          t("documents.assistantKnowledge.failed_to_unlink", { type: typeName })
        );
      }
    } catch (error) {
      console.error("Error unlinking document:", error);
      const typeName = getTypeName(type);
      toast.error(
        t("documents.assistantKnowledge.failed_to_unlink", { type: typeName })
      );
    } finally {
      setUnlinkingDocumentIds((prev) => prev.filter((id) => id !== documentId));
    }
  };

  const getTypeName = (type: DocumentType): string => {
    switch (type) {
      case "upload_document":
        return t("documents.assistantKnowledge.type_document");
      case "image":
        return t("documents.assistantKnowledge.type_image");
      case "topic_knowledge":
        return t("documents.assistantKnowledge.type_topic_knowledge");
      case "crawl_document":
        return t("documents.assistantKnowledge.type_crawl_document");
      default:
        return type;
    }
  };

  const renderTable = (section: TableSection) => {
    const sectionDocuments = documents[section.type];
    const isLoading = loading[section.type];
    const searchQuery = searchQueries[section.type];
    const pageNumber = pageNumbers[section.type];
    const totalPages = Math.ceil(totalItems[section.type] / pageSize);

    return (
      <div key={section.type} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {section.icon}
            <h3 className="text-lg font-medium">{t(section.titleKey)}</h3>
            <span className="text-sm text-muted-foreground">
              (
              {t("documents.assistantKnowledge.items_count", {
                count: totalItems[section.type],
              })}
              )
            </span>
          </div>
          <Button
            size="sm"
            className="flex items-center gap-2 min-w-[80px]"
            onClick={() => handleAddClick(section.type)}
          >
            <Plus className="h-4 w-4" />
            {t(section.addKey)}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t(section.searchKey)}
            value={searchQuery}
            onChange={(e) => handleSearchChange(section.type, e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="border rounded-md">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sectionDocuments.length === 0 ? (
            <div className="text-center py-8">
              <h4 className="text-sm font-medium">{t(section.noFoundKey)}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {t(section.noAvailableKey)}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">
                    {t("documents.assistantKnowledge.table_title")}
                  </TableHead>
                  <TableHead className="text-xs">
                    {t("documents.assistantKnowledge.table_language")}
                  </TableHead>
                  <TableHead className="text-xs">
                    {t("documents.assistantKnowledge.table_created")}
                  </TableHead>
                  <TableHead className="text-right text-xs">
                    {t("documents.assistantKnowledge.table_actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectionDocuments.map((document) => (
                  <TableRow
                    key={document.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="max-w-[300px]">
                      <div className="text-xs font-medium truncate">
                        {document.title}
                      </div>
                      {document.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {document.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {document.language}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(document.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlinkDocument(document.id, section.type);
                        }}
                        disabled={unlinkingDocumentIds.includes(document.id)}
                        className="h-7 px-2 text-xs"
                      >
                        {unlinkingDocumentIds.includes(document.id) ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            {t(
                              "documents.assistantKnowledge.unlinking_document"
                            )}
                          </>
                        ) : (
                          t("documents.assistantKnowledge.unlink_document")
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(section.type, pageNumber - 1)}
              disabled={pageNumber === 1}
            >
              {t("documents.assistantKnowledge.previous_page")}
            </Button>
            <span className="flex items-center text-sm">
              {t("documents.assistantKnowledge.page_info", {
                current: pageNumber,
                total: totalPages,
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(section.type, pageNumber + 1)}
              disabled={pageNumber >= totalPages}
            >
              {t("documents.assistantKnowledge.next_page")}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderSidebar = () => {
    if (!showSidebar || !sidebarType) return null;

    const typeName = getTypeName(sidebarType);
    const sidebarTotalPages = Math.ceil(sidebarTotalItems / pageSize);

    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20"
          onClick={handleCloseSidebar}
        />

        {/* Sidebar */}
        <div className="relative ml-auto w-[600px] bg-background border-l shadow-xl h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b h-18">
            <h2 className="text-lg font-semibold">
              {t("documents.assistantKnowledge.add_documents_title", {
                type: typeName,
              })}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleCloseSidebar}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t(
                  "documents.assistantKnowledge.search_available",
                  {
                    type: typeName,
                  }
                )}
                value={sidebarSearchQuery}
                onChange={(e) => setSidebarSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Available Documents */}
            <div>
              <h3 className="text-sm font-medium mb-3">
                {t("documents.assistantKnowledge.available_documents", {
                  type: typeName,
                })}
              </h3>

              {sidebarLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : availableDocuments.length === 0 ? (
                <div className="text-center py-8 border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    {t("documents.assistantKnowledge.no_available_documents", {
                      type: typeName,
                    })}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableDocuments.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {document.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {document.language}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(document.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {(document as any).actionType !== "none" && (
                        <Button
                          size="sm"
                          variant={
                            (document as any).actionType === "unlink"
                              ? "destructive"
                              : "default"
                          }
                          onClick={() => {
                            if ((document as any).actionType === "link") {
                              handleLinkDocument(document.id, sidebarType);
                            } else if (
                              (document as any).actionType === "unlink"
                            ) {
                              handleUnlinkDocument(document.id, sidebarType);
                            }
                          }}
                          disabled={
                            linkingDocumentIds.includes(document.id) ||
                            unlinkingDocumentIds.includes(document.id)
                          }
                        >
                          {linkingDocumentIds.includes(document.id) ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              {t(
                                "documents.assistantKnowledge.linking_document"
                              )}
                            </>
                          ) : unlinkingDocumentIds.includes(document.id) ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              {t(
                                "documents.assistantKnowledge.unlinking_document"
                              )}
                            </>
                          ) : (document as any).actionType === "link" ? (
                            t("documents.assistantKnowledge.link_document")
                          ) : (
                            t("documents.assistantKnowledge.unlink_document")
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Sidebar Pagination */}
              {sidebarTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarPageNumber(sidebarPageNumber - 1)}
                    disabled={sidebarPageNumber === 1}
                  >
                    {t("documents.assistantKnowledge.previous_page")}
                  </Button>
                  <span className="flex items-center text-sm">
                    {t("documents.assistantKnowledge.page_info", {
                      current: sidebarPageNumber,
                      total: sidebarTotalPages,
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarPageNumber(sidebarPageNumber + 1)}
                    disabled={sidebarPageNumber >= sidebarTotalPages}
                  >
                    {t("documents.assistantKnowledge.next_page")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 pb-8">
      {tableSections.map((section, index) => (
        <div key={section.type}>
          {renderTable(section)}
          {index < tableSections.length - 1 && <Separator className="my-8" />}
        </div>
      ))}

      {renderSidebar()}
    </div>
  );
}

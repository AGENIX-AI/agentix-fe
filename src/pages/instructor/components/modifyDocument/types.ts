import type { Document as ApiDocument } from "@/api/documents";

export type DocumentType = "document" | "image" | "all" | undefined;

export interface Document extends ApiDocument {
  view_link?: string;
}

export interface SearchFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  documentType: DocumentType;
  setDocumentType: (type: DocumentType) => void;
}

export interface DocumentTableProps<T = any> {
  documents: T[];
  getStatusColor: (status: string) => string;
  getLinkStatus?: (linked: boolean | undefined) => string;
  showLinkedColumn?: boolean;
  onLinkDocument?: (documentId: string) => void;
  onUnlinkDocument?: (documentId: string) => void;
  loadingDocumentIds?: string[];
}

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  documentsCount: number;
  setCurrentPage: (page: number) => void;
}

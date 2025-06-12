export interface Document {
  id: string;
  title: string;
  url: string;
  file_name: string;
  upload_status: "pending" | "completed" | "failed" | "not_complete";
  created_at: string;
  number_index?: number;
  type: "document" | "image";
  assistant_document?: { assistant_id: string }[];
}

export type DocumentType = "document" | "image" | "all" | undefined;

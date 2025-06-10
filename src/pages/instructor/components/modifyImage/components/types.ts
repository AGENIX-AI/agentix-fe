// Common types for image components

export interface ImageStats {
	total: number;
	processed: number;
	analyzed: number;
}

export interface ImageData {
	id: string;
	url: string;
	file_name: string;
	content: string;
	summary: string;
	created_at: string;
	assistantId?: string;
}

import axiosInstance from "../axios-instance";

export interface Blog {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface BlogsResponse {
  blogs: Blog[];
  total_count: number;
  page_number: number;
  page_size: number;
}

export interface CreateBlogRequest {
  title: string;
  content: string;
}

export interface UpdateBlogRequest {
  title: string;
  content: string;
}

export interface BlogsQueryParams {
  page_number?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: number;
  search?: string;
}

// Blogs API
export const fetchBlogs = async (params?: BlogsQueryParams): Promise<BlogsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page_number) queryParams.append('page_number', params.page_number.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params?.sort_order) queryParams.append('sort_order', params.sort_order.toString());
  if (params?.search) queryParams.append('search', params.search);
  
  const url = `/blog${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await axiosInstance.get(url);
  return response.data;
};

export const fetchBlog = async (id: string): Promise<Blog> => {
  const response = await axiosInstance.get(`/blog/${id}`);
  return response.data;
};

export const createBlog = async (data: CreateBlogRequest): Promise<Blog> => {
  const response = await axiosInstance.post('/blog', data);
  return response.data;
};

export const updateBlog = async (
  id: string,
  data: UpdateBlogRequest
): Promise<Blog> => {
  const response = await axiosInstance.put(`/blog/${id}`, data);
  return response.data;
};

export const deleteBlog = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/blog/${id}`);
};
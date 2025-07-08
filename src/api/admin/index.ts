import Cookies from "js-cookie";
import * as Sentry from "@sentry/react";

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const accessToken = Cookies.get("edvara_access_token");
  const refreshToken = Cookies.get("edvara_refresh_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (refreshToken) {
    headers["X-Refresh-Token"] = refreshToken;
  }

  return headers;
};

export interface InstructorProfile {
  user_id: string;
  instructor_name: string;
  instructor_description: string;
  profile_image: string | null;
  background_image: string | null;
  payment_info: string | null;
  created_at: string;
  updated_at: string;
  id: string;
}

export interface Instructor {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  last_sign_in_at: string;
  computed_role: string;
  instructor_profile: InstructorProfile;
}

export interface Student {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  last_sign_in_at: string;
  computed_role: string;
}

export interface AssistantPersonality {
  id: string;
  voice: string;
  created_at: string;
  mood_style: number;
  assistant_id: string;
  formality_style: number;
  instruction_style: number;
  assertiveness_style: number;
  communication_style: number;
  response_length_style: number;
}

export interface AssistantData {
  id: string;
  name: string;
  tagline: string;
  image: string;
  language: string;
  base_stream_name: string | null;
  owner_id: string;
  speciality: string;
  created_at: string;
  updated_at: string;
  description: string;
  role: string;
  status: string;
  personality: AssistantPersonality[];
  instructor_profile: InstructorProfile;
}

export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AssistantsResponse {
  success: boolean;
  assistants: AssistantData[];
  total_count: number;
  page_number: number;
  page_size: number;
}

export interface FetchParams {
  page_size?: number;
  page_number?: number;
  search?: string;
}

export interface AssistantFetchParams extends FetchParams {
  sort_by?: string;
  sort_order?: number;
  have_personality?: boolean;
}

export interface RevenueOverview {
  today_total: number;
  month_total: number;
  year_total: number;
}

export interface PackageInfo {
  id: string;
  price: number;
  credit: number;
  popular: boolean;
}

export interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
}

export interface TransactionData {
  id: string | null;
  payment_id: string;
  package_id: string;
  package: PackageInfo;
  amount: number;
  currency: string;
  status: string;
  completed_at: string;
  user_info: UserInfo;
}

export interface DailyTransactionData {
  date: string;
  transactions: TransactionData[];
  daily_revenue: number;
  daily_count: number;
  completed_count: number;
}

export interface TransactionsByDayResponse {
  success: boolean;
  data: DailyTransactionData[];
  summary: {
    total_transactions: number;
    total_revenue: number;
    total_days: number;
    date_range: {
      start_date: string;
      end_date: string;
    };
  };
}

export interface TransactionsByDayParams {
  days_back?: number;
  start_date?: string;
  end_date?: string;
}

export interface Package {
  id: string;
  credit: number;
  price: number;
  popular: boolean;
  name: string;
  description: string;
}

export interface CreatePackageRequest {
  name: string;
  description: string;
  price: number;
  credit: number;
}

export interface UpdatePackageRequest {
  name: string;
  description: string;
  price: number;
  credit: number;
}

export interface CountStatsResponse {
  users_count: number;
  assistants_count: number;
  conversations_count: number;
  waitlist_false_count: number;
}

export interface WaitlistEntry {
  user_id: string;
  approved: boolean;
  metadata?: {
    role: string;
    field: string;
    business: string;
  };
}

export interface FeedbackUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
}

export interface FeedbackData {
  id: number;
  user_id: string;
  feedback_type: string;
  description: string;
  screenshot_urls: string[];
  created_at: string;
  rating: number;
  is_response: boolean;
  user: FeedbackUser;
}

export interface FeedbacksResponse {
  success: boolean;
  feedbacks: FeedbackData[];
  total_count: number;
  page_number: number;
  page_size: number;
}

export interface FeedbackFetchParams extends FetchParams {
  sort_by?: string;
  sort_order?: number;
}

export const adminApi = {
  async getInstructors({
    page_size = 10,
    page_number = 1,
    search = "",
  }: FetchParams = {}): Promise<PaginationResponse<Instructor>> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const params = new URLSearchParams({
      page_size: page_size.toString(),
      page_number: page_number.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    try {
      const response = await fetch(
        `${baseUrl}/admin/get_instructors?${params}`,
        {
          method: "GET",
          credentials: "include",
          headers,
        },
      );

      if (!response.ok) {
        Sentry.captureException(
          new Error(`Failed to fetch instructors: ${response.statusText}`),
        );
        throw new Error(`Failed to fetch instructors: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching instructors:", error);
      throw error;
    }
  },

  async getStudents({
    page_size = 10,
    page_number = 1,
    search = "",
  }: FetchParams = {}): Promise<PaginationResponse<Student>> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const params = new URLSearchParams({
      page_size: page_size.toString(),
      page_number: page_number.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    try {
      const response = await fetch(`${baseUrl}/admin/get_students?${params}`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        Sentry.captureException(
          new Error(`Failed to fetch students: ${response.statusText}`),
        );
        throw new Error(`Failed to fetch students: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  },

  async getAssistants({
    page_size = 10,
    page_number = 1,
    search = "",
    sort_by = "created_at",
    sort_order = -1,
    have_personality = true,
  }: AssistantFetchParams = {}): Promise<AssistantsResponse> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const params = new URLSearchParams({
      page_size: page_size.toString(),
      page_number: page_number.toString(),
      sort_by,
      sort_order: sort_order.toString(),
      have_personality: have_personality.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    try {
      const response = await fetch(
        `${baseUrl}/admin/get_all_assistants?${params}`,
        {
          method: "GET",
          credentials: "include",
          headers,
        },
      );

      if (!response.ok) {
        Sentry.captureException(
          new Error(`Failed to fetch assistants: ${response.statusText}`),
        );
        throw new Error(`Failed to fetch assistants: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching assistants:", error);
      throw error;
    }
  },

  async getTotalRevenue(): Promise<RevenueOverview> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    try {
      const response = await fetch(`${baseUrl}/admin/get_total_revenue`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        Sentry.captureException(
          new Error(`Failed to fetch total revenue: ${response.statusText}`),
        );
        throw new Error(
          `Failed to fetch total revenue: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching total revenue:", error);
      throw error;
    }
  },

  async getTransactionsByDay({
    days_back = 30,
    start_date,
    end_date,
  }: TransactionsByDayParams = {}): Promise<TransactionsByDayResponse> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const params = new URLSearchParams();

    if (start_date && end_date) {
      params.append("start_date", start_date);
      params.append("end_date", end_date);
    } else {
      params.append("days_back", days_back.toString());
    }

    try {
      const response = await fetch(
        `${baseUrl}/admin/get_transactions_by_day?${params}`,
        {
          method: "GET",
          credentials: "include",
          headers,
        },
      );

      if (!response.ok) {
        Sentry.captureException(
          new Error(`Failed to fetch transactions: ${response.statusText}`),
        );
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  async getPackages(): Promise<Package[]> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    try {
      const response = await fetch(`${baseUrl}/package/get_package`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        Sentry.captureException(
          new Error(`Failed to fetch packages: ${response.statusText}`),
        );
        throw new Error(`Failed to fetch packages: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching packages:", error);
      throw error;
    }
  },

  async createPackage(packageData: CreatePackageRequest): Promise<Package> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    try {
      const response = await fetch(`${baseUrl}/package/`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        Sentry.captureException(
          new Error(`Failed to create package: ${response.statusText}`),
        );
        throw new Error(`Failed to create package: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating package:", error);
      throw error;
    }
  },

  async updatePackage(
    id: string,
    packageData: UpdatePackageRequest,
  ): Promise<Package> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    try {
      const response = await fetch(`${baseUrl}/package/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        Sentry.captureException(
          new Error(`Failed to update package: ${response.statusText}`),
        );
        throw new Error(`Failed to update package: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating package:", error);
      throw error;
    }
  },

  async deletePackage(id: string): Promise<Package> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    try {
      const response = await fetch(`${baseUrl}/package/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        Sentry.captureException(
          new Error(`Failed to delete package: ${response.statusText}`),
        );
        throw new Error(`Failed to delete package: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting package:", error);
      throw error;
    }
  },

  async getCountStats(): Promise<CountStatsResponse> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    try {
      const response = await fetch(`${baseUrl}/admin/count_stats`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        Sentry.captureException(
          new Error(`Failed to fetch count stats: ${response.statusText}`),
        );
        throw new Error(`Failed to fetch count stats: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching count stats:", error);
      throw error;
    }
  },

  async getWaitlist(): Promise<WaitlistEntry[]> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    try {
      const response = await fetch(`${baseUrl}/admin/get_waitlist`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        Sentry.captureException(
          new Error(`Failed to fetch waitlist: ${response.statusText}`),
        );
        throw new Error(`Failed to fetch waitlist: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      throw error;
    }
  },

  async approveWaitlist(userId: string): Promise<WaitlistEntry> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    try {
      const response = await fetch(
        `${baseUrl}/admin/approve_waitlist/${userId}`,
        {
          method: "POST",
          credentials: "include",
          headers,
        },
      );

      if (!response.ok) {
        Sentry.captureException(
          new Error(`Failed to approve waitlist: ${response.statusText}`),
        );
        throw new Error(`Failed to approve waitlist: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error approving waitlist:", error);
      throw error;
    }
  },

  async getFeedbacks({
    page_size = 10,
    page_number = 1,
    search = "",
    sort_by = "created_at",
    sort_order = -1,
  }: FeedbackFetchParams = {}): Promise<FeedbacksResponse> {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const params = new URLSearchParams({
      page_size: page_size.toString(),
      page_number: page_number.toString(),
      sort_by,
      sort_order: sort_order.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    try {
      const response = await fetch(`${baseUrl}/admin/get_feedbacks?${params}`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        Sentry.captureException(
          new Error(`Failed to fetch feedbacks: ${response.statusText}`),
        );
        throw new Error(`Failed to fetch feedbacks: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      throw error;
    }
  },
};

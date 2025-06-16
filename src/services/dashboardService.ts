// Import api when actual endpoints are available
// import api from './api';

// Types for dashboard API responses
export interface DashboardStats {
  assistantsCount: number;
  documentsCount: number;
  activeStudentsCount: number;
}

export interface AssistantStats {
  id: string;
  name: string;
  avatar: string | null;
  interactions: number;
  chatCount: number;
  completionRate: number;
}

export interface DocumentStats {
  id: string;
  title: string;
  type: "document" | "image";
  views: number;
  uploadDate: string;
}

export interface StudentStats {
  id: string;
  name: string;
  avatar: string | null;
  lastActive: string;
  progress: number;
  currentTopic?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  assistants: AssistantStats[];
  documents: DocumentStats[];
  students: StudentStats[];
}

/**
 * Fetches all dashboard statistics for an instructor
 * 
 * @param instructorId - The ID of the instructor
 * @returns Dashboard data including stats, assistants, documents, and students
 */
export async function fetchDashboardData(_instructorId: string): Promise<DashboardData> {
  try {
    // In a real implementation, this would call the actual API endpoint
    // const response = await api.get(`/instructors/${instructorId}/dashboard`);
    // return response.data;
    
    // For now, we'll return mock data
    return {
      stats: {
        assistantsCount: 4,
        documentsCount: 15,
        activeStudentsCount: 28,
      },
      assistants: [
        {
          id: "1",
          name: "Math Tutor",
          avatar: null,
          interactions: 156,
          chatCount: 89,
          completionRate: 92,
        },
        {
          id: "2",
          name: "Physics Assistant",
          avatar: null,
          interactions: 124,
          chatCount: 67,
          completionRate: 85,
        },
        {
          id: "3",
          name: "Programming Guide",
          avatar: null,
          interactions: 98,
          chatCount: 54,
          completionRate: 78,
        },
        {
          id: "4",
          name: "Language Tutor",
          avatar: null,
          interactions: 87,
          chatCount: 42,
          completionRate: 81,
        },
      ],
      documents: [
        {
          id: "1",
          title: "Introduction to Calculus",
          type: "document",
          views: 45,
          uploadDate: "2023-05-15",
        },
        {
          id: "2",
          title: "Physics Formulas",
          type: "document",
          views: 38,
          uploadDate: "2023-05-18",
        },
        {
          id: "3",
          title: "Programming Basics Diagram",
          type: "image",
          views: 32,
          uploadDate: "2023-05-20",
        },
        {
          id: "4",
          title: "Language Learning Guide",
          type: "document",
          views: 29,
          uploadDate: "2023-05-22",
        },
        {
          id: "5",
          title: "Mathematics Exercise Solutions",
          type: "document",
          views: 24,
          uploadDate: "2023-05-25",
        },
      ],
      students: [
        {
          id: "1",
          name: "Alex Johnson",
          avatar: null,
          lastActive: "2023-06-15",
          progress: 85,
          currentTopic: "Advanced Calculus",
        },
        {
          id: "2",
          name: "Maria Garcia",
          avatar: null,
          lastActive: "2023-06-14",
          progress: 72,
          currentTopic: "Quantum Physics",
        },
        {
          id: "3",
          name: "Hiroshi Tanaka",
          avatar: null,
          lastActive: "2023-06-13",
          progress: 94,
          currentTopic: "Object-Oriented Programming",
        },
        {
          id: "4",
          name: "Sophie Martin",
          avatar: null,
          lastActive: "2023-06-12",
          progress: 65,
          currentTopic: "French Literature",
        },
        {
          id: "5",
          name: "David Wilson",
          avatar: null,
          lastActive: "2023-06-10",
          progress: 78,
          currentTopic: "Linear Algebra",
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  enrollmentDate: string;
  description: string;
  category: string;
  image: string;
}

interface Assignment {
  id: string;
  title: string;
  courseId: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  grade?: number;
  feedback?: string;
}

interface Progress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  lastAccessDate: string;
  averageGrade: number;
  certificates: string[];
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  enrolledCourses: number;
  completedCourses: number;
  profileImage: string;
  level: string;
  bio?: string;
}

// Sample data
const sampleCourses: Course[] = [
  {
    id: "course-001",
    title: "Introduction to Web Development",
    instructor: "Jane Smith",
    progress: 65,
    enrollmentDate: "2025-02-15",
    description:
      "Learn the fundamentals of HTML, CSS, and JavaScript for building modern websites.",
    category: "Development",
    image: "https://placehold.co/400x300?text=Web+Dev",
  },
  {
    id: "course-002",
    title: "Data Science Fundamentals",
    instructor: "John Doe",
    progress: 32,
    enrollmentDate: "2025-03-10",
    description:
      "Master the basics of data analysis, visualization, and machine learning concepts.",
    category: "Data Science",
    image: "https://placehold.co/400x300?text=Data+Science",
  },
  {
    id: "course-003",
    title: "Mobile App Development with React Native",
    instructor: "Sarah Johnson",
    progress: 18,
    enrollmentDate: "2025-04-20",
    description:
      "Build cross-platform mobile applications using React Native framework.",
    category: "Development",
    image: "https://placehold.co/400x300?text=React+Native",
  },
];

const sampleAssignments: Assignment[] = [
  {
    id: "assign-001",
    title: "Create a Personal Portfolio",
    courseId: "course-001",
    dueDate: "2025-06-10",
    status: "pending",
  },
  {
    id: "assign-002",
    title: "Data Visualization Project",
    courseId: "course-002",
    dueDate: "2025-06-15",
    status: "submitted",
  },
  {
    id: "assign-003",
    title: "HTML & CSS Quiz",
    courseId: "course-001",
    dueDate: "2025-05-30",
    status: "graded",
    grade: 92,
    feedback: "Excellent work! Your CSS implementation is very clean.",
  },
];

const sampleProgress: Progress[] = [
  {
    courseId: "course-001",
    completedLessons: 13,
    totalLessons: 20,
    lastAccessDate: "2025-05-23",
    averageGrade: 88,
    certificates: [],
  },
  {
    courseId: "course-002",
    completedLessons: 6,
    totalLessons: 18,
    lastAccessDate: "2025-05-20",
    averageGrade: 85,
    certificates: [],
  },
  {
    courseId: "course-003",
    completedLessons: 3,
    totalLessons: 16,
    lastAccessDate: "2025-05-22",
    averageGrade: 90,
    certificates: [],
  },
];

const sampleProfile: StudentProfile = {
  id: "student-123",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  joinDate: "2025-01-15",
  enrolledCourses: 3,
  completedCourses: 1,
  profileImage: "https://placehold.co/200x200?text=AJ",
  level: "Intermediate",
  bio: "Passionate about learning new technologies and developing skills in programming and data science.",
};

// API functions
export const getStudentCourses = async (): Promise<{
  success: boolean;
  courses: Course[];
}> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    courses: sampleCourses,
  };
};

export const getStudentAssignments = async (): Promise<{
  success: boolean;
  assignments: Assignment[];
}> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: true,
    assignments: sampleAssignments,
  };
};

export const getStudentProgress = async (): Promise<{
  success: boolean;
  progress: Progress[];
}> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 700));

  return {
    success: true,
    progress: sampleProgress,
  };
};

export const getStudentProfile = async (): Promise<{
  success: boolean;
  profile: StudentProfile;
}> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    profile: sampleProfile,
  };
};

export const enrollInCourse = async (
  courseId: string
): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    message: `Successfully enrolled in course with ID: ${courseId}`,
  };
};

export const submitAssignment = async (
  assignmentId: string
): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Log submission data (in a real app, this would be sent to the server)

  return {
    success: true,
    message: `Assignment ${assignmentId} submitted successfully!`,
  };
};

export const updateStudentProfile = async (
  profileData: Partial<StudentProfile>
): Promise<{ success: boolean; profile: StudentProfile }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 900));

  // Merge with existing profile
  const updatedProfile = {
    ...sampleProfile,
    ...profileData,
  };

  return {
    success: true,
    profile: updatedProfile,
  };
};

const enTranslation = {
  // Common
  app_name: "Edvara",
  loading: "Loading...",
  error: "Error",
  success: "Success",

  // Navigation
  nav_home: "Home",
  nav_dashboard: "Dashboard",
  nav_login: "Login",
  nav_signup: "Sign Up",
  nav_logout: "Logout",
  nav_instructor: "Instructor",
  nav_student: "Student",

  // Home page
  home_title: "Transform Your Learning Experience",
  home_subtitle:
    "Join thousands of learners worldwide on our cutting-edge platform.",
  home_welcome: "Welcome to Edvara - Your complete learning platform",

  // Auth pages
  login_title: "Login to Edvara",
  signup_title: "Create an Account",
  email_label: "Email",
  email_placeholder: "Enter your email",
  password_label: "Password",
  password_placeholder: "Enter your password",
  confirm_password_label: "Confirm Password",
  confirm_password_placeholder: "Confirm your password",
  name_label: "Full Name",
  name_placeholder: "Enter your full name",
  login_button: "Login",
  signup_button: "Sign Up",
  login_loading: "Logging in...",
  signup_loading: "Creating account...",
  no_account: "Don't have an account?",
  has_account: "Already have an account?",
  passwords_not_match: "Passwords do not match",
  login_failed: "Failed to login. Please try again.",
  signup_failed: "Failed to create account. Please try again.",

  // New auth structure
  auth: {
    login: {
      title: "Login to Edvara",
      subtitle: "Sign in to your account to continue",
      submit: "Login",
      sendMagicLink: "Send Magic Link",
      password: "Password",
      magicLink: "Magic Link",
      forgotPassword: "Forgot password?",
      continueWith: "or continue with",
      loginWithPasskey: "Login with Passkey",
      dontHaveAnAccount: "Don't have an account?",
      createAnAccount: "Create one now",
      hints: {
        linkSent: {
          title: "Check your email",
          message:
            "We've sent a magic link to your email address. Please click the link to sign in.",
        },
      },
    },
    magicLink: {
      verifying: "Verifying your identity",
      pleaseWait: "Please wait while we authenticate you...",
      authFailed: "Authentication Failed",
      returnToLogin: "Return to Login",
    },
    signup: {
      email: "Email",
      password: "Password",
    },
    errors: {
      wrongPassword: "Incorrect password. Please try again.",
      userNotFound: "No account found with this email address.",
      emailAlreadyInUse: "This email is already in use.",
      weakPassword: "Password is too weak. Please use a stronger password.",
      invalidEmail: "Invalid email address.",
      expiredLink: "This link has expired. Please request a new one.",
      invalidLink: "This link is invalid or has already been used.",
      tooManyRequests: "Too many attempts. Please try again later.",
      magicLinkFailed: "Failed to send magic link. Please try again.",
      invalidCredentials:
        "Invalid credentials. Please check your email and password.",
      defaultError: "An error occurred. Please try again.",
    },
    providers: {
      google: "Google",
      github: "GitHub",
      facebook: "Facebook",
    },
  },
  organizations: {
    invitation: {
      title: "Organization Invitation",
      message:
        "You've been invited to join an organization. Complete your sign in to accept.",
    },
  },

  // Dashboard
  dashboard_welcome:
    "Welcome to your Edvara dashboard. This page is protected and only accessible after login.",
  user_info: "User Information",
  user_name: "Name",
  user_email: "Email",
  user_id: "Account ID",
  loading_data: "Loading your data...",

  // Instructor Page
  instructor_welcome: "Welcome to the instructor dashboard. Here you can manage your courses and students.",
  instructor_page_title: "Instructor Dashboard",
  instructor_content: "As an instructor, you have access to create and manage courses, track student progress, and provide feedback.",
  instructor_courses: "Your Courses",
  instructor_courses_description: "View and manage the courses you are teaching.",
  instructor_students: "Your Students",
  instructor_students_description: "View and manage the students enrolled in your courses.",

  // Student Page
  student_welcome: "Welcome to the student dashboard. Here you can access your courses and track your progress.",
  student_page_title: "Student Dashboard",
  student_content: "As a student, you have access to your enrolled courses, assignments, and learning materials.",
  student_courses: "Your Courses",
  student_courses_description: "View and access the courses you are enrolled in.",
  student_progress: "Your Progress",
  student_progress_description: "Track your learning progress and achievements.",
  student_assignments: "Your Assignments",
  student_profile: "Your Profile",
  student_profile_title: "Student Profile",
  student_no_assignments: "You have no pending assignments.",

  // Language
  language: "Language",
  language_en: "English",
  language_vi: "Vietnamese",

  // Instructor Finder
  findInstructor: "Find Instructor",
  searchByName: "Search by name",
  search: "Search",
  loadingInstructors: "Loading instructors",
  errorLoadingInstructors: "Error loading instructors",
  noInstructorsFound: "No instructors found",
  noDescriptionAvailable: "No description available",
  selectInstructor: "Select Instructor",
  foundInstructors: "Found {{count}} instructor(s)",
  page: "Page",
  of: "of",
  previous: "Previous",
  next: "Next",
};

export default enTranslation;

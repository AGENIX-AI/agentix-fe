const enTranslation: Record<string, any> = {
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

  // Documents
  documents: {
    your_documents: "Your Documents",
    add_document: "Add Document",
    search_documents: "Search documents...",
    no_documents_found: "No documents found",
    no_documents_available: "No documents available in",
    original_documents: "Original Documents",
    reference_documents: "Reference Documents",
    search_original: "Search original documents...",
    search_reference: "Search reference documents...",
    switch_to_original: "Switch to Original",
    switch_to_reference: "Switch to Reference",
    document_mode_updated: "Document mode updated to",
    view: "View",
    linked: "Linked",
    not_linked: "Not Linked",
    document_linked: "Document linked successfully",
    document_unlinked: "Document unlinked successfully",
    failed_to_link: "Failed to link document",
    failed_to_unlink: "Failed to unlink document",
    failed_to_update_mode: "Failed to update document mode",
  },

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
      emailNotConfirmed:
        "Please verify your email address before signing in. Check your email for a confirmation link.",
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
  instructor_welcome:
    "Welcome to the instructor dashboard. Here you can manage your courses and students.",
  instructor_page_title: "Instructor Dashboard",
  instructor_content:
    "As an instructor, you have access to create and manage courses, track student progress, and provide feedback.",
  instructor_courses: "Your Courses",
  instructor_courses_description:
    "View and manage the courses you are teaching.",
  instructor_students: "Your Students",
  instructor_students_description:
    "View and manage the students enrolled in your courses.",

  // Student Page
  student_welcome:
    "Welcome to the student dashboard. Here you can access your courses and track your progress.",
  student_page_title: "Student Dashboard",
  student_content:
    "As a student, you have access to your enrolled courses, assignments, and learning materials.",
  student_courses: "Your Courses",
  student_courses_description:
    "View and access the courses you are enrolled in.",
  student_progress: "Your Progress",
  student_progress_description:
    "Track your learning progress and achievements.",
  student_assignments: "Your Assignments",
  student_profile: "Your Profile",
  student_profile_title: "Student Profile",
  student_no_assignments: "You have no pending assignments.",

  // Language
  language: "Language",
  language_en: "English",
  language_vi: "Vietnamese",

  common: {
    loading: "Loading...",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    confirm: "Confirm",
    instructor: "Instructor",
  },

  // Help Section
  help: {
    fetch_failed: "Failed to fetch help topics. Please try again later.",
    load_topics_failed: "Failed to load topics. Please try again later.",
    refresh_failed: "Failed to refresh help topics. Please try again later.",
    content_failed: "Failed to load help content. Please try again later.",
    no_topics: "No topics available",
    select_topic: "Select a topic to view its content",
  },

  // Chat Components
  chat: {
    input: {
      placeholder: "Type a message...",
      archived_placeholder: "This conversation is archived",
      send: "Send",
      uploadImage: "Upload image",
      mention_student: "Mention student",
    },
    loading: {
      conversation: "Loading conversation...",
    },
    roles: {
      assistant: "Assistant",
      assistant_the: "The assistant",
      student: "Student",
      student_initials: "ST",
      instructor: "Instructor",
    },
    assistant: {
      verification_warning: "{{name}} may be wrong. Please verify.",
    },

    image: {
      previewImage: "Preview image",
      pastedImage: "Pasted image",
      removeImage: "Remove image",
      uploadImage: "Upload image",
    },
    messageCards: {
      unknownType: "Unknown message card type",
    },
    summaryCard: {
      sessionSummary: "Session Summary",
      language: "Language",
    },
    topicCard: {
      language: "Language",
      goal: "Goal",
      problem: "Problem",
    },
    tutoringTopicCard: {
      processing: "Processing...",
      goToTopic: "Go To Topic",
      accept: "Accept",
      editTutoringTopic: "Edit Tutoring Topic",
      topics: "Topics",
      goals: "Goals",
      problems: "Problems",
      saveChanges: "Save Changes",
    },
    chatBox: {
      agentTyping: "Agent is typing...",
      typeMessage: "Type your message here...",
    },
    message: {
      play_audio: "Play audio",
      stop_audio: "Stop audio",
      typing: "Assistant is typing...",
      typeMessage: "Type your message here...",
      error_playing_audio: "Error playing audio",
      error_fetching_audio: "Error fetching or playing audio",
      latex_error: "Error rendering LaTeX",
      view_full_image: "View full image",
      close: "Close",
      image_uploaded: "[Image uploaded]",
    },
    create_assistant_form: {
      name_required: "Assistant name is required",
      error_creating: "An error occurred while creating the assistant",
      name_label: "Name",
      name_placeholder: "Assistant name",
      tagline_label: "Tagline",
      tagline_placeholder: "Short description of what this assistant does",
      description_label: "Description",
      description_placeholder: "Detailed description of the assistant's capabilities",
      language_label: "Language",
      language_placeholder: "Select language",
      creating: "Creating...",
      create: "Create",
      cancel: "Cancel"
    },
    learning_topic_form: {
      topic_required: "Topic is required",
      no_conversation: "No active conversation found",
      success: "Training topic created successfully",
      error_creating: "An error occurred while creating the training topic",
      topic_label: "Topic",
      topic_placeholder: "Enter training topic",
      focus_label: "Focus On",
      focus_placeholder: "What should this topic focus on?",
      creating: "Creating...",
      create: "Create",
      cancel: "Cancel"
    },
    tasks: {
      title: "Task",
      select_task: "Select a task to get started",
      create_topic: "Create a learning topic",
      create_assistant: "Create your assistant",
      create_knowledge_base: "Create knowledge base",
      create_knowledge_component: "Create knowledge component",
      create_training_topic: "Create training topic",
      manage_knowledge_space: "Manage knowledge space",
      feedback: "Feedback",
      feedback_placeholder: "Feedback functionality coming soon...",
      share_with_instructor: "Share with instructor",
      share_with_instructor_description:
        "Share this conversation with your instructor. The instructor will be able to view the conversation history.",
      share_success: "Sharing request sent successfully",
      share_info: "The instructor will be notified of your request",
      archived: "Archive a topic",
      archive_description:
        "Send achievement notification for this tutoring conversation. This will notify your instructor about your learning progress.",
      archive_success: "Achievement sent successfully",
      error_no_conversation: "No active conversation to archive",
      error_already_shared:
        "You have already requested to share this conversation",
      error_you_are_instructor: "You are the instructor of this conversation",
      error_generic: "Failed to share conversation: {{error}}",
      error_archive_generic: "Failed to send achievement: {{error}}",
    },
    create_topic_form: {
      title: "Create a tutoring topic",
      topic: "Topic",
      topic_placeholder: "Describe topic to discuss",
      goal: "Goal",
      goal_placeholder: "What goal want to got about topic",
      problems: "Problems",
      problems_placeholder: "Current concern, challenge, or need for topic",
      language: "Language",
      language_placeholder: "Select language",
      create: "Create",
    },
    header: {
      default_name: "AI Assistant",
      tagline: "Powered by AI",
      back: "Back",
      new_chat: "New Chat",
      show_history: "Show history",
      hide_history: "Hide history",
      powered_by: "{{name}}",
    },
  },

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
  recommendedInstructors: "Recommended Instructors",

  // Student Pages
  student: {
    instructorFinder: {
      instructor: "Instructor",
      edvaraName: "Edvara",
      edvaraDescription:
        "Edvara is a platform that helps you find the best instructors for your needs.",
      noDescriptionAvailable: "No description available",
      searchByName: "Search by name",
      search: "Search",
      recommendedInstructors: "Recommended Instructors",
      errorLoadingInstructors: "Error loading instructors",
      noInstructorsFound: "No instructors found",
      foundInstructors: "Found {{count}} instructor(s)",
    },
    history: {
      privateTopics: "Private Topics",
      collaborativeChats: "Collaborative Chats",
      title: "Chats",
    },
    userConversations: {
      loadingConversations: "Loading conversations...",
    },
    tutoringConversations: {
      noConversationsFound: "No tutoring conversations found.",
    },
    tutoringConversation: {
      defaultName: "Tutoring Session",
    },
    conversationItem: {
      assistant: "Assistant",
    },
    collapsedTutoring: {
      avatar: "Avatar",
    },
    collapsedCollaborative: {
      assistant: "Assistant",
      with: "with",
    },
    systemAssistant: {
      loading: "Loading system assistant...",
      defaultName: "System Assistant",
      defaultDescription: "Support you to use the App effectively",
    },
    collaborativeChats: {
      noConversationsFound: "No collaborative conversations found.",
      defaultChatName: "Collaborative Chat",
    },
    navigation: {
      student: "Student",
      instructor: "Instructor",
      about: "About",
      search: "Search",
    },
    sidebar: {
      notifications: "Notifications",
      creditsWithCount: "Credits: {{formattedCount}}",
      creditsDisplay: "{{formattedCount}} Credits",
      dashboard: "Dashboard",
      find_instructor: "Find Instructor",
      documents: "Documents",
      help_center: "Help Center",
      navigation: "Navigation",
    },
    rightPanel: {
      collapse: "Collapse miniapp",
      expand: "Expand miniapp",
      clickToExpand: "Click to expand {{title}}",
      profileInfo: "Profile Info",
      followingPosts: "Following Posts",
      assistantTopics: "Assistant Topics",
      tasks: "Tasks",
      agentCapability: "Agent Capability Statement",
      findInstructor: "Find Instructor",
      buyCredits: "Buy Credits",
      helpCenter: "Help Center",
      homePage: "Home Page",
      rightPanel: "Right Panel",
    },
    assistantProfile: {
      loading: "Loading assistant profile...",
      noInfo: "No assistant information available",
      generalAssistance: "General Assistance",
      generalAssistant: "General Assistant",
      profile: "Profile",
      error: "Failed to load data. Please try again later.",
      about: "About",
      specialty: "Specialty",
      topics: "Topics",
      loadingTopics: "Loading topics...",
      failedToLoadData: "Failed to load conversation data",
      category: "Category",
      count: "Count",
      loadingCanvas: "Loading Canvas...",
      noTasksAvailable: "No conversation tasks available",
      noTasksDescription:
        "There are currently no tasks for this conversation. Tasks may be added as the conversation progresses.",
      conversationTasks: "Conversation Tasks",
      goal: "Goal",
      step: "Step",
      taskDetails: "Task Details",
      status: "Status",
      failedToLoadConversationData: "Failed to load conversation data",
      generalTopic: "General Topic",
      mentoringTopics: "Mentoring Topics",
      privateTopics: "Private Topics",
      archivedTopics: "Archived Topics",
      categoryTopics: "{{category}} Topics",
      noConversationsFound: "No conversations found",
    },
    instructorProfile: {
      aiAssistants: "AI Assistants",
      ai: "· AI",
      noAIAssistantsAvailable: "No AI assistants available",
      instructorGroups: "Instructor Groups",
      harvardGroupName: "Harvard Business Review",
      socialMediaGroupName: "Social Media Marketing",
      memberCount: "{{count}} members",
      join: "Join",
      failedToLoadData: "Failed to load data. Please try again later.",
      instructorInitials: "Instructor Initials",
      instructorPosts: "{{name}} Posts",
      noPostsAvailable: "No posts available",
      firstDegree: "1st",
      entrepreneurshipRole: "Entrepreneurship Evangelist and Educator",
      timeAgo: "{{time}}",
    },
    buyCredits: {
      title: "Buy Credits",
      loadError: "Failed to load credit packages. Please try again.",
      selectPackage: "Please select a package first",
      createOrderError: "Failed to create payment order. Please try again.",
      paymentSuccess:
        "Payment successful! {{credits}} credits added to your account.",
      paymentProcessingError:
        "Payment processing failed. Please contact support if you were charged.",
      paymentError: "Payment failed. Please try again or contact support.",
      enterVoucherCode: "Please enter a voucher code",
      voucherSuccess:
        "Voucher redeemed successfully! {{credits}} credits added to your account.",
      voucherError: "Failed to redeem voucher",
      voucherRedeemError: "Failed to redeem voucher. Please try again.",
      voucherRedeemed: "Voucher redeemed successfully!",
      voucherRedeemFailCheck:
        "Failed to redeem voucher. Please check the code and try again.",
      paymentSuccessful: "Payment Successful!",
      makeAnotherPurchase: "Make Another Purchase",
      choosePackage: "Choose Your Credit Package",
      description:
        "Purchase credits to unlock premium features and enhanced capabilities",
      haveAVoucherCode: "Have a Voucher Code?",
      redeemVoucherCode:
        "Redeem your voucher code to get free credits instantly",
      voucherPlaceholder: "Enter voucher code (e.g., EDVARA-123456)",
      redeem: "Redeem",
      redeeming: "Redeeming...",
      redeemed: "Redeemed!",
      redeemVoucher: "Redeem Voucher",
      purchaseCredits: "Purchase Credits",
      loadingPackages: "Loading packages...",
      completePurchase: "Complete Your Purchase",
      purchasingCredits: "You're purchasing {{credits}} credits for ${{price}}",
      capturingPayment: "Capturing payment...",
      processingPayment: "Processing payment...",
      paymentFailed: "Payment failed. Please try again or contact support.",
      cancel: "Cancel",
      paymentCancelled: "Payment cancelled",
      securePayment: "🔒 Secure payment processing powered by PayPal",
      encryptedInfo: "Your payment information is encrypted and protected",
    },
  },
  document: {
    table: {
      title: "Title",
      type: "Type",
      status: "Status",
      linked: "Linked",
      created: "Created",
      actions: "Actions",
      view: "View",
      linked_status: {
        linked: "Linked",
        not_linked: "Not Linked",
      },
    },
  },
  assistant: {
    profile: {
      loading: "Loading assistant profile...",
      no_info: "No assistant information available",
      general_assistance: "General Assistance",
      general_assistant: "General Assistant",
      created: "Created",
      about: "About",
      capabilities: "Capabilities",
      specialty: "Specialty",
      personality_traits: "Personality Traits",
      no_traits: "No personality traits available",
      traits: {
        instruction_style: "Instruction Style",
        communication_style: "Communication Style",
        response_length_style: "Response Length Style",
        formality_style: "Formality Style",
        assertiveness_style: "Assertiveness Style",
        mood_style: "Mood Style",
      },
    },
    tabs: {
      tasks: "Tasks",
      profile: "Profile",
      topics: "Topics",
    },
    tasks: {
      loading: "Loading Canvas...",
      no_conversation: "No conversation selected",
      select_conversation:
        "Please select a conversation from the history panel to view tasks.",
      no_content: "No conversation content available",
      content_explanation:
        "There is currently no content for this conversation. Tasks and Q&A may be added as the conversation progresses.",
      conversation_content: "Conversation Content",
      goal: "Goal",
      step: "Step",
      content: "Content",
      status: "Status",
    },
    topics: {
      load_failed: "Failed to load conversation data",
      loading: "Loading Canvas...",
      no_conversations: "No conversations found",
      goal: "Goal",
      categories: {
        general: "General Topics",
        learning: "Training Topics",
        archived: "Archived Topics",
        default: "{{category}} Topics",
      },
    },
  },
  credits: {
    title: "Buy Credits",
    choose_package: "Choose Your Credit Package",
    description:
      "Purchase credits to unlock premium features and enhanced capabilities",
    package: {
      most_popular: "Most Popular",
      credits: "Credits",
      per_thousand: "${{price}} per 1K credits",
    },
    payment: {
      complete_purchase: "Complete Your Purchase",
      purchasing: "You're purchasing {{formattedCount}} credits for ${{price}}",
      capturing: "Capturing payment...",
      processing: "Processing payment...",
      failed: "Payment failed. Please try again or contact support.",
    },
    voucher: {
      title: "Have a Voucher Code?",
      description: "Redeem your voucher code to get free credits instantly",
      placeholder: "Enter voucher code (e.g., EDVARA-123456)",
      redeem: "Redeem",
      redeeming: "Redeeming...",
      success: "✅ Voucher redeemed successfully!",
      failed:
        "❌ Failed to redeem voucher. Please check the code and try again.",
    },
    success: {
      title: "Payment Successful!",
      credits_added:
        "{{formattedCount}} credits have been added to your account.",
      payment_complete:
        "Payment successful! {{formattedCount}} credits added to your account.",
    },
    actions: {
      another_purchase: "Make Another Purchase",
      cancel: "Cancel",
    },
    security: {
      secure_payment: "🔒 Secure payment processing powered by PayPal",
      encrypted: "Your payment information is encrypted and protected",
    },
    errors: {
      load_failed: "Failed to load credit packages. Please try again.",
      select_package: "Please select a package first",
      create_order: "Failed to create order",
      payment_order: "Failed to create payment order. Please try again.",
      payment_incomplete: "Payment was not completed successfully",
      payment_processing: "Payment processing failed",
      payment_failed_contact:
        "Payment processing failed. Please contact support if you were charged.",
      payment_failed: "Payment failed. Please try again.",
      enter_voucher: "Please enter a voucher code",
      redeem_voucher: "Failed to redeem voucher",
    },
    info: {
      payment_cancelled: "Payment cancelled",
    },
  },
};

export default enTranslation;

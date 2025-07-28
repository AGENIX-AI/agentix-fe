const viTranslation = {
  // Common
  app_name: "Edvara",
  loading: "Đang tải...",
  error: "Lỗi",
  success: "Thành công",

  // Navigation
  nav_home: "Trang chủ",
  nav_dashboard: "Bảng điều khiển",
  nav_login: "Đăng nhập",
  nav_signup: "Đăng ký",
  nav_logout: "Đăng xuất",
  nav_instructor: "Giảng viên",
  nav_student: "Học viên",

  // Home page
  home_title: "Thay đổi trải nghiệm học tập của bạn",
  home_subtitle:
    "Tham gia cùng hàng nghìn người học trên khắp thế giới trên nền tảng hiện đại của chúng tôi.",
  home_welcome: "Chào mừng đến với Edvara - Nền tảng học tập toàn diện của bạn",

  // Documents
  documents: {
    your_documents: "Tài liệu của bạn",
    add_document: "Thêm tài liệu",
    search_documents: "Tìm kiếm tài liệu...",
    no_documents_found: "Không tìm thấy tài liệu",
    no_documents_available: "Không có tài liệu trong chế độ",
    original_documents: "Tài liệu gốc",
    reference_documents: "Tài liệu tham khảo",
    search_original: "Tìm kiếm tài liệu gốc...",
    search_reference: "Tìm kiếm tài liệu tham khảo...",
    switch_to_original: "Chuyển sang Gốc",
    switch_to_reference: "Chuyển sang Tham khảo",
    document_mode_updated: "Chế độ tài liệu đã được cập nhật thành",
    view: "Xem",
    linked: "Đã liên kết",
    not_linked: "Chưa liên kết",
    document_linked: "Tài liệu đã được liên kết thành công",
    document_unlinked: "Tài liệu đã được hủy liên kết thành công",
    failed_to_link: "Không thể liên kết tài liệu",
    failed_to_unlink: "Không thể hủy liên kết tài liệu",
    failed_to_update_mode: "Không thể cập nhật chế độ tài liệu",
  },

  // Auth pages
  login_title: "Đăng nhập vào Edvara",
  signup_title: "Tạo tài khoản mới",
  email_label: "Email",
  email_placeholder: "Nhập email của bạn",
  password_label: "Mật khẩu",
  password_placeholder: "Nhập mật khẩu của bạn",
  confirm_password_label: "Xác nhận mật khẩu",
  confirm_password_placeholder: "Xác nhận mật khẩu của bạn",
  name_label: "Họ và tên",
  name_placeholder: "Nhập họ và tên của bạn",
  login_button: "Đăng nhập",
  signup_button: "Đăng ký",
  login_loading: "Đang đăng nhập...",
  signup_loading: "Đang tạo tài khoản...",
  no_account: "Bạn chưa có tài khoản?",
  has_account: "Bạn đã có tài khoản?",
  passwords_not_match: "Mật khẩu không khớp",
  login_failed: "Đăng nhập thất bại. Vui lòng thử lại.",
  signup_failed: "Tạo tài khoản thất bại. Vui lòng thử lại.",

  // New auth structure
  auth: {
    login: {
      title: "Đăng nhập vào Edvara",
      subtitle: "Đăng nhập vào tài khoản của bạn để tiếp tục",
      submit: "Đăng nhập",
      sendMagicLink: "Gửi liên kết ma thuật",
      password: "Mật khẩu",
      magicLink: "Liên kết ma thuật",
      forgotPassword: "Quên mật khẩu?",
      continueWith: "hoặc tiếp tục với",
      loginWithPasskey: "Đăng nhập với Passkey",
      dontHaveAnAccount: "Bạn chưa có tài khoản?",
      createAnAccount: "Tạo tài khoản ngay",
      hints: {
        linkSent: {
          title: "Kiểm tra email của bạn",
          message:
            "Chúng tôi đã gửi một liên kết ma thuật đến địa chỉ email của bạn. Vui lòng nhấp vào liên kết để đăng nhập.",
        },
      },
    },
    magicLink: {
      verifying: "Đang xác minh danh tính của bạn",
      pleaseWait: "Vui lòng đợi trong khi chúng tôi xác thực bạn...",
      authFailed: "Xác thực thất bại",
      returnToLogin: "Quay lại trang đăng nhập",
    },
    signup: {
      email: "Email",
      password: "Mật khẩu",
    },
    errors: {
      wrongPassword: "Mật khẩu không chính xác. Vui lòng thử lại.",
      userNotFound: "Không tìm thấy tài khoản với địa chỉ email này.",
      emailAlreadyInUse: "Email này đã được sử dụng.",
      weakPassword: "Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.",
      invalidEmail: "Địa chỉ email không hợp lệ.",
      expiredLink: "Liên kết này đã hết hạn. Vui lòng yêu cầu liên kết mới.",
      invalidLink: "Liên kết này không hợp lệ hoặc đã được sử dụng.",
      tooManyRequests: "Quá nhiều lần thử. Vui lòng thử lại sau.",
      magicLinkFailed: "Không thể gửi liên kết ma thuật. Vui lòng thử lại.",
      emailNotConfirmed:
        "Vui lòng xác minh địa chỉ email của bạn trước khi đăng nhập. Kiểm tra email để tìm liên kết xác nhận.",
      invalidCredentials:
        "Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra email và mật khẩu của bạn.",
      defaultError: "Đã xảy ra lỗi. Vui lòng thử lại.",
    },
    providers: {
      google: "Tiếp tục với Google",
      github: "Tiếp tục với GitHub",
      facebook: "Tiếp tục với Facebook",
    },
  },
  organizations: {
    invitation: {
      title: "Lời mời tổ chức",
      message:
        "Bạn đã được mời tham gia một tổ chức. Hoàn tất đăng nhập để chấp nhận.",
    },
  },

  // Dashboard
  dashboard_welcome:
    "Chào mừng đến với bảng điều khiển Edvara của bạn. Trang này được bảo vệ và chỉ có thể truy cập sau khi đăng nhập.",
  user_info: "Thông tin người dùng",
  user_name: "Tên",
  user_email: "Email",
  user_id: "Mã tài khoản",
  loading_data: "Đang tải dữ liệu của bạn...",

  // Instructor Page
  instructor_welcome:
    "Chào mừng đến với bảng điều khiển giảng viên. Tại đây bạn có thể quản lý khóa học và học viên của mình.",
  instructor_page_title: "Bảng Điều Khiển Giảng Viên",
  instructor_content:
    "Với tư cách là giảng viên, bạn có quyền tạo và quản lý khóa học, theo dõi tiến độ học viên và cung cấp phản hồi.",
  instructor_courses: "Khóa Học Của Bạn",
  instructor_courses_description:
    "Xem và quản lý các khóa học mà bạn đang giảng dạy.",
  instructor_students: "Học Viên Của Bạn",
  instructor_students_description:
    "Xem và quản lý các học viên đã đăng ký khóa học của bạn.",

  // Student Page
  student_welcome:
    "Chào mừng đến với bảng điều khiển học viên. Tại đây bạn có thể truy cập khóa học và theo dõi tiến độ của mình.",
  student_page_title: "Bảng Điều Khiển Học Viên",
  student_content:
    "Với tư cách là học viên, bạn có quyền truy cập vào các khóa học đã đăng ký, bài tập và tài liệu học tập.",
  student_courses: "Khóa Học Của Bạn",
  student_courses_description:
    "Xem và truy cập các khóa học mà bạn đã đăng ký.",
  student_progress: "Tiến Độ Của Bạn",
  student_progress_description:
    "Theo dõi tiến độ học tập và thành tích của bạn.",
  student_assignments: "Bài Tập Của Bạn",
  student_profile: "Hồ Sơ Của Bạn",
  student_profile_title: "Hồ Sơ Học Viên",
  student_no_assignments: "Bạn không có bài tập đang chờ.",

  // Language
  language: "Ngôn ngữ",
  language_en: "Tiếng Anh",
  language_vi: "Tiếng Việt",

  // Common
  common: {
    loading: "Đang tải...",
    cancel: "Hủy",
    save: "Lưu",
    delete: "Xóa",
    edit: "Chỉnh sửa",
    confirm: "Xác nhận",
    share: "Chia sẻ",
    sharing: "Đang chia sẻ...",
    send: "Gửi",
    sending: "Đang gửi...",
    instructor: "Giảng viên",
  },

  // Chat Components
  chat: {
    input: {
      placeholder: "Nhập tin nhắn...",
      archived_placeholder: "Cuộc trò chuyện này đã được lưu trữ",
      send: "Gửi",
      uploadImage: "Tải lên hình ảnh",
      mention_student: "Nhắc đến học viên",
    },
    loading: {
      conversation: "Đang tải cuộc trò chuyện...",
    },
    roles: {
      assistant: "Trợ lý",
      assistant_the: "Trợ lý",
      student: "Học viên",
      student_initials: "HV",
      instructor: "Giảng viên",
    },
    assistant: {
      verification_warning: "{{name}} có thể sai. Vui lòng xác minh.",
    },

    image: {
      previewImage: "Xem trước hình ảnh",
      pastedImage: "Hình ảnh đã dán",
      removeImage: "Xóa hình ảnh",
      uploadImage: "Tải lên hình ảnh",
    },
    messageCards: {
      unknownType: "Loại thẻ tin nhắn không xác định",
    },
    summaryCard: {
      sessionSummary: "Tóm tắt phiên",
      language: "Ngôn ngữ",
    },
    topicCard: {
      language: "Ngôn ngữ",
      goal: "Mục tiêu",
      problem: "Vấn đề",
    },
    tutoringTopicCard: {
      processing: "Đang xử lý...",
      goToTopic: "Đi đến chủ đề",
      accept: "Chấp nhận",
      editTutoringTopic: "Chỉnh sửa chủ đề dạy kèm",
      topics: "Chủ đề",
      goals: "Mục tiêu",
      problems: "Vấn đề",
      saveChanges: "Lưu thay đổi",
    },
    chatBox: {
      agentTyping: "Tác nhân đang nhập...",
      typeMessage: "Nhập tin nhắn của bạn tại đây...",
    },
    tasks: {
      title: "Nhiệm vụ",
      select_task: "Chọn một nhiệm vụ để bắt đầu",
      create_topic: "Tạo một chủ đề học tập",
      create_assistant: "Tạo trợ lý của bạn",
      create_knowledge_base: "Tạo cơ sở kiến thức",
      create_knowledge_component: "Tạo thành phần kiến thức",
      create_training_topic: "Tạo chủ đề đào tạo",
      manage_knowledge_space: "Quản lý không gian kiến thức",
      feedback: "Phản hồi",
      feedback_placeholder: "Chức năng phản hồi sẽ sớm ra mắt...",
      share_with_instructor: "Chia sẻ với giảng viên",
      share_with_instructor_description:
        "Chia sẻ cuộc trò chuyện này với giảng viên của bạn. Giảng viên sẽ có thể xem lịch sử cuộc trò chuyện.",
      share_success: "Yêu cầu chia sẻ đã được gửi thành công",
      share_info: "Giảng viên sẽ được thông báo về yêu cầu của bạn",
      archived: "Lưu trữ",
      archive_description:
        "Gửi thông báo thành tựu cho cuộc trò chuyện học tập này. Điều này sẽ thông báo cho giảng viên về tiến trình học tập của bạn.",
      archive_success: "Thành tựu đã được gửi thành công",
      error_no_conversation: "Không có cuộc trò chuyện nào để lưu trữ",
      error_already_shared: "Bạn đã yêu cầu chia sẻ cuộc trò chuyện này rồi",
      error_you_are_instructor: "Bạn là giảng viên của cuộc trò chuyện này",
      error_generic: "Không thể chia sẻ cuộc trò chuyện: {{error}}",
      error_archive_generic: "Không thể gửi thành tựu: {{error}}",
    },
    create_topic_form: {
      title: "Tạo một chủ đề học tập",
      topic: "Chủ đề",
      topic_placeholder: "Mô tả chủ đề muốn thảo luận",
      goal: "Mục tiêu",
      goal_placeholder: "Mục tiêu bạn muốn đạt được về chủ đề này",
      problems: "Vấn đề",
      problems_placeholder:
        "Mối quan tâm, thách thức hoặc nhu cầu hiện tại về chủ đề",
      language: "Ngôn ngữ",
      language_placeholder: "Chọn ngôn ngữ",
      create: "Tạo",
    },
    header: {
      back: "Quay lại",
      new_chat: "Cuộc trò chuyện mới",
      show_history: "Hiển thị lịch sử",
      hide_history: "Ẩn lịch sử",
      powered_by: "Được hỗ trợ bởi {{name}}",
    },
    message: {
      play_audio: "Phát âm thanh",
      stop_audio: "Dừng âm thanh",
      typing: "Trợ lý đang nhập...",
      typeMessage: "Nhập tin nhắn của bạn tại đây...",
      error_playing_audio: "Lỗi phát âm thanh",
      error_fetching_audio: "Lỗi tải hoặc phát âm thanh",
      latex_error: "Lỗi hiển thị LaTeX",
      view_full_image: "Xem hình ảnh đầy đủ",
      close: "Đóng",
      image_uploaded: "[Đã tải lên hình ảnh]",
    },
    create_assistant_form: {
      name_required: "Tên trợ lý là bắt buộc",
      error_creating: "Đã xảy ra lỗi khi tạo trợ lý",
      name_label: "Tên",
      name_placeholder: "Tên trợ lý",
      tagline_label: "Khẩu hiệu",
      tagline_placeholder: "Mô tả ngắn gọn về những gì trợ lý này làm",
      description_label: "Mô tả",
      description_placeholder: "Mô tả chi tiết về khả năng của trợ lý",
      language_label: "Ngôn ngữ",
      language_placeholder: "Chọn ngôn ngữ",
      creating: "Đang tạo...",
      create: "Tạo",
      cancel: "Hủy"
    },
    learning_topic_form: {
      topic_required: "Chủ đề là bắt buộc",
      no_conversation: "Không tìm thấy cuộc trò chuyện đang hoạt động",
      success: "Chủ đề đào tạo đã được tạo thành công",
      error_creating: "Đã xảy ra lỗi khi tạo chủ đề đào tạo",
      topic_label: "Chủ đề",
      topic_placeholder: "Nhập chủ đề đào tạo",
      focus_label: "Tập trung vào",
      focus_placeholder: "Chủ đề này nên tập trung vào điều gì?",
      creating: "Đang tạo...",
      create: "Tạo",
      cancel: "Hủy"
    },
  },

  // Instructor Finder
  findInstructor: "Tìm Giảng Viên",
  searchByName: "Tìm theo tên",
  search: "Tìm kiếm",
  loadingInstructors: "Đang tải danh sách giảng viên",
  errorLoadingInstructors: "Lỗi khi tải danh sách giảng viên",
  noInstructorsFound: "Không tìm thấy giảng viên nào",
  noDescriptionAvailable: "Không có mô tả",
  selectInstructor: "Chọn Giảng Viên",
  foundInstructors: "Tìm thấy {{count}} giảng viên",
  page: "Trang",
  of: "của",
  previous: "Trước",
  next: "Tiếp",
  recommendedInstructors: "Giảng viên được đề xuất",

  // Student Pages
  student: {
    instructorFinder: {
      instructor: "Giảng viên",
      edvaraName: "Edvara",
      edvaraDescription:
        "Edvara là nền tảng giúp bạn tìm kiếm giảng viên phù hợp với nhu cầu của bạn.",
      noDescriptionAvailable: "Không có mô tả",
      searchByName: "Tìm theo tên",
      search: "Tìm kiếm",
      recommendedInstructors: "Giảng viên được đề xuất",
      errorLoadingInstructors: "Lỗi khi tải danh sách giảng viên",
      noInstructorsFound: "Không tìm thấy giảng viên nào",
      foundInstructors: "Tìm thấy {{count}} giảng viên",
    },
    history: {
      privateTopics: "Chủ đề riêng tư",
      collaborativeChats: "Trò chuyện cộng tác",
      title: "Đoạn chat",
    },
    userConversations: {
      loadingConversations: "Đang tải cuộc trò chuyện...",
    },
    tutoringConversations: {
      noConversationsFound: "Không tìm thấy cuộc trò chuyện học kèm nào.",
    },
    tutoringConversation: {
      defaultName: "Buổi học kèm",
    },
    conversationItem: {
      assistant: "Trợ lý",
    },
    collapsedTutoring: {
      avatar: "Ảnh đại diện",
    },
    collapsedCollaborative: {
      assistant: "Trợ lý",
      with: "với",
    },
    systemAssistant: {
      loading: "Đang tải trợ lý hệ thống...",
      defaultName: "Trợ lý hệ thống",
      defaultDescription: "Hỗ trợ bạn sử dụng ứng dụng hiệu quả",
    },
    collaborativeChats: {
      noConversationsFound: "Không tìm thấy cuộc trò chuyện hợp tác nào.",
      defaultChatName: "Trò chuyện hợp tác",
    },
    navigation: {
      student: "Học viên",
      instructor: "Giảng viên",
      about: "Giới thiệu",
      search: "Tìm kiếm",
    },
    sidebar: {
      notifications: "Thông báo",
      creditsWithCount: "Tín dụng: {{formattedCount}}",
      creditsDisplay: "{{formattedCount}} Tín dụng",
      dashboard: "Bảng điều khiển",
      find_instructor: "Tìm giảng viên",
      documents: "Tài liệu",
      help_center: "Trung tâm trợ giúp",
      navigation: "Điều hướng",
    },
    rightPanel: {
      collapse: "Thu gọn ứng dụng",
      expand: "Mở rộng ứng dụng",
      clickToExpand: "Nhấp để mở rộng {{title}}",
      profileInfo: "Thông tin hồ sơ",
      followingPosts: "Bài viết đang theo dõi",
      assistantTopics: "Chủ đề trợ lý",
      tasks: "Nhiệm vụ",
      agentCapability: "Tuyên bố khả năng của đại lý",
      findInstructor: "Tìm giảng viên",
      buyCredits: "Mua tín dụng",
      helpCenter: "Trung tâm trợ giúp",
      homePage: "Trang chủ",
      rightPanel: "Bảng điều khiển bên phải",
    },
    instructorProfile: {
      aiAssistants: "Trợ lý AI",
      ai: "· AI",
      noAIAssistantsAvailable: "Không có trợ lý AI nào",
      instructorGroups: "Nhóm của giảng viên",
      harvardGroupName: "Harvard Business Review",
      socialMediaGroupName: "Marketing Mạng xã hội",
      memberCount: "{{count}} thành viên",
      join: "Tham gia",
      failedToLoadData: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
      instructorInitials: "Tên viết tắt của giảng viên",
      instructorPosts: "Bài đăng của {{name}}",
      noPostsAvailable: "Không có bài đăng nào",
      firstDegree: "Cấp 1",
      entrepreneurshipRole: "Nhà truyền bá và Giáo dục về Khởi nghiệp",
      timeAgo: "{{time}}",
    },
    assistantProfile: {
      loading: "Đang tải hồ sơ trợ lý...",
      noInfo: "Không có thông tin trợ lý",
      generalAssistance: "Hỗ trợ chung",
      generalAssistant: "Trợ lý chung",
      profile: "Hồ sơ",
      error: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
      about: "Giới thiệu",
      specialty: "Chuyên môn",
      topics: "Chủ đề",
      loadingTopics: "Đang tải chủ đề...",
      failedToLoadData: "Không thể tải dữ liệu cuộc trò chuyện",
      category: "Danh mục",
      count: "Số lượng",
      loadingCanvas: "Đang tải Canvas...",
      noTasksAvailable: "Không có nhiệm vụ cuộc trò chuyện",
      noTasksDescription:
        "Hiện tại không có nhiệm vụ nào cho cuộc trò chuyện này. Nhiệm vụ có thể được thêm vào khi cuộc trò chuyện tiến triển.",
      conversationTasks: "Nhiệm vụ cuộc trò chuyện",
      goal: "Mục tiêu",
      step: "Bước",
      taskDetails: "Chi tiết nhiệm vụ",
      status: "Trạng thái",
      failedToLoadConversationData: "Không thể tải dữ liệu cuộc trò chuyện",
      generalTopic: "Chủ đề chung",
      mentoringTopics: "Chủ đề hướng dẫn",
      privateTopics: "Chủ đề riêng tư",
      archivedTopics: "Chủ đề đã lưu trữ",
      categoryTopics: "Chủ đề {{category}}",
      noConversationsFound: "Không tìm thấy cuộc trò chuyện nào",
    },
    buyCredits: {
      title: "Mua tín dụng",
      loadError: "Không thể tải gói tín dụng. Vui lòng thử lại.",
      selectPackage: "Vui lòng chọn một gói",
      createOrderError: "Không thể tạo đơn hàng thanh toán. Vui lòng thử lại.",
      paymentSuccess:
        "Thanh toán thành công! {{credits}} tín dụng đã được thêm vào tài khoản của bạn.",
      paymentProcessingError:
        "Xử lý thanh toán thất bại. Vui lòng liên hệ hỗ trợ nếu bạn đã bị tính phí.",
      paymentError:
        "Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
      enterVoucherCode: "Vui lòng nhập mã voucher",
      voucherSuccess:
        "Đổi voucher thành công! {{credits}} tín dụng đã được thêm vào tài khoản của bạn.",
      voucherError: "Không thể đổi voucher",
      voucherRedeemError: "Không thể đổi voucher. Vui lòng thử lại.",
      voucherRedeemed: "Đã đổi voucher thành công!",
      voucherRedeemFailCheck:
        "Không thể đổi voucher. Vui lòng kiểm tra mã và thử lại.",
      paymentSuccessful: "Thanh toán thành công!",
      makeAnotherPurchase: "Thực hiện giao dịch khác",
      choosePackage: "Chọn gói tín dụng của bạn",
      description:
        "Mua tín dụng để mở khóa tính năng cao cấp và khả năng nâng cao",
      haveAVoucherCode: "Có mã voucher?",
      redeemVoucherCode:
        "Đổi mã voucher của bạn để nhận tín dụng miễn phí ngay lập tức",
      voucherPlaceholder: "Nhập mã voucher (ví dụ: EDVARA-123456)",
      redeem: "Đổi",
      redeeming: "Đang đổi...",
      redeemed: "Đã đổi!",
      redeemVoucher: "Đổi Voucher",
      purchaseCredits: "Mua tín dụng",
      loadingPackages: "Đang tải gói...",
      completePurchase: "Hoàn tất giao dịch của bạn",
      purchasingCredits: "Bạn đang mua {{credits}} tín dụng với giá ${{price}}",
      capturingPayment: "Đang ghi nhận thanh toán...",
      processingPayment: "Đang xử lý thanh toán...",
      paymentFailed:
        "Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
      cancel: "Hủy",
      paymentCancelled: "Đã hủy thanh toán",
      securePayment: " Xử lý thanh toán an toàn được cung cấp bởi PayPal",
      encryptedInfo: "Thông tin thanh toán của bạn được mã hóa và bảo vệ",
    },
  },
  document: {
    table: {
      title: "Tiêu đề",
      type: "Loại",
      status: "Trạng thái",
      linked: "Đã liên kết",
      created: "Đã tạo",
      actions: "Hành động",
      view: "Xem",
      linked_status: {
        linked: "Đã liên kết",
        not_linked: "Chưa liên kết",
      },
    },
  },
  assistant: {
    profile: {
      loading: "Đang tải hồ sơ trợ lý...",
      no_info: "Không có thông tin trợ lý",
      general_assistance: "Hỗ trợ chung",
      general_assistant: "Trợ lý chung",
      created: "Đã tạo",
      about: "Giới thiệu",
      capabilities: "Khả năng",
      specialty: "Chuyên môn",
      personality_traits: "Đặc điểm tính cách",
      no_traits: "Không có đặc điểm tính cách",
      traits: {
        instruction_style: "Phong cách hướng dẫn",
        communication_style: "Phong cách giao tiếp",
        response_length_style: "Độ dài phản hồi",
        formality_style: "Mức độ trang trọng",
        assertiveness_style: "Mức độ tự tin",
        mood_style: "Tâm trạng",
      },
    },
    tabs: {
      tasks: "Nhiệm vụ",
      profile: "Hồ sơ",
      topics: "Chủ đề",
    },
    tasks: {
      loading: "Đang tải...",
      no_conversation: "Chưa chọn cuộc hội thoại",
      select_conversation:
        "Vui lòng chọn một cuộc hội thoại từ bảng lịch sử để xem nhiệm vụ.",
      no_content: "Không có nội dung cuộc hội thoại",
      content_explanation:
        "Hiện tại không có nội dung cho cuộc hội thoại này. Nhiệm vụ và Hỏi đáp có thể được thêm vào khi cuộc hội thoại tiến triển.",
      conversation_content: "Nội dung cuộc hội thoại",
      goal: "Mục tiêu",
      step: "Bước",
      content: "Nội dung",
      status: "Trạng thái",
    },
    topics: {
      load_failed: "Không thể tải dữ liệu cuộc hội thoại",
      loading: "Đang tải...",
      no_conversations: "Không tìm thấy cuộc hội thoại",
      goal: "Mục tiêu",
      categories: {
        general: "Chủ đề chung",
        learning: "Chủ đề đào tạo",
        archived: "Chủ đề đã lưu trữ",
        default: "Chủ đề {{category}}",
      },
    },
  },
  credits: {
    title: "Mua tín dụng",
    choose_package: "Chọn gói tín dụng của bạn",
    description:
      "Mua tín dụng để mở khóa các tính năng cao cấp và khả năng nâng cao",
    package: {
      most_popular: "Phổ biến nhất",
      credits: "Tín dụng",
      per_thousand: "${{price}} cho mỗi 1K tín dụng",
    },
    payment: {
      complete_purchase: "Hoàn tất mua hàng",
      purchasing: "Bạn đang mua {{formattedCount}} tín dụng với giá ${{price}}",
      capturing: "Đang xử lý thanh toán...",
      processing: "Đang xử lý thanh toán...",
      failed: "Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
    },
    voucher: {
      title: "Bạn có mã giảm giá?",
      description:
        "Đổi mã giảm giá của bạn để nhận tín dụng miễn phí ngay lập tức",
      placeholder: "Nhập mã giảm giá (ví dụ: EDVARA-123456)",
      redeem: "Đổi",
      redeeming: "Đang đổi...",
      success: "✅ Đổi mã giảm giá thành công!",
      failed: "❌ Không thể đổi mã giảm giá. Vui lòng kiểm tra mã và thử lại.",
    },
    success: {
      title: "Thanh toán thành công!",
      credits_added:
        "{{formattedCount}} tín dụng đã được thêm vào tài khoản của bạn.",
      payment_complete:
        "Thanh toán thành công! {{formattedCount}} tín dụng đã được thêm vào tài khoản của bạn.",
    },
    actions: {
      another_purchase: "Thực hiện giao dịch khác",
      cancel: "Hủy",
    },
    security: {
      secure_payment: "🔒 Xử lý thanh toán an toàn được cung cấp bởi PayPal",
      encrypted: "Thông tin thanh toán của bạn được mã hóa và bảo vệ",
    },
    errors: {
      load_failed: "Không thể tải gói tín dụng. Vui lòng thử lại.",
      select_package: "Vui lòng chọn một gói trước",
      create_order: "Không thể tạo đơn hàng",
      payment_order: "Không thể tạo đơn hàng thanh toán. Vui lòng thử lại.",
      payment_incomplete: "Thanh toán không được hoàn tất thành công",
      payment_processing: "Xử lý thanh toán thất bại",
      payment_failed_contact:
        "Xử lý thanh toán thất bại. Vui lòng liên hệ hỗ trợ nếu bạn đã bị trừ tiền.",
      payment_failed: "Thanh toán thất bại. Vui lòng thử lại.",
      enter_voucher: "Vui lòng nhập mã giảm giá",
      redeem_voucher: "Không thể đổi mã giảm giá",
    },
    info: {
      payment_cancelled: "Đã hủy thanh toán",
    },
  },
};

export default viTranslation;

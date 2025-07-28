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
    },
    image: {
      previewImage: "Xem trước hình ảnh",
      pastedImage: "Hình ảnh đã dán",
      removeImage: "Xóa hình ảnh",
    },
    messageCards: {
      unknownType: "Loại thẻ tin nhắn không xác định"
    },
    summaryCard: {
      sessionSummary: "Tóm tắt phiên",
      language: "Ngôn ngữ"
    },
    topicCard: {
      language: "Ngôn ngữ",
      goal: "Mục tiêu",
      problem: "Vấn đề"
    },
    tutoringTopicCard: {
      processing: "Đang xử lý...",
      goToTopic: "Đi đến chủ đề",
      accept: "Chấp nhận",
      editTutoringTopic: "Chỉnh sửa chủ đề dạy kèm",
      topics: "Chủ đề",
      goals: "Mục tiêu",
      problems: "Vấn đề",
      saveChanges: "Lưu thay đổi"
    },
    chatBox: {
      agentTyping: "Tác nhân đang nhập...",
      typeMessage: "Nhập tin nhắn của bạn tại đây..."
    },
    tasks: {
      title: "Nhiệm vụ",
      select_task: "Chọn một nhiệm vụ để bắt đầu",
      create_topic: "Tạo một chủ đề học tập",
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
      typing: "Đang nhập...",
      typeMessage: "Nhập tin nhắn của bạn tại đây...",
      error_playing_audio: "Lỗi khi phát âm thanh",
      error_fetching_audio: "Lỗi khi tải hoặc phát âm thanh",
      latex_error: "Lỗi khi hiển thị LaTeX",
      view_full_image: "Xem ảnh đầy đủ",
      close: "Đóng"
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
    navigation: {
      student: 'Học viên',
      instructor: 'Giảng viên',
      about: 'Giới thiệu',
      search: 'Tìm kiếm'
    },
    rightPanel: {
      collapse: 'Thu gọn ứng dụng',
      expand: 'Mở rộng ứng dụng',
      clickToExpand: 'Nhấp để mở rộng {{title}}',
      profileInfo: 'Thông tin hồ sơ',
      followingPosts: 'Bài viết đang theo dõi',
      assistantTopics: 'Chủ đề trợ lý',
      tasks: 'Nhiệm vụ',
      agentCapability: 'Tuyên bố khả năng của đại lý',
      findInstructor: 'Tìm giảng viên',
      buyCredits: 'Mua tín dụng',
      helpCenter: 'Trung tâm trợ giúp',
      homePage: 'Trang chủ',
      rightPanel: 'Bảng điều khiển bên phải'
    },
    assistantProfile: {
      loading: 'Đang tải hồ sơ trợ lý...',
      noInfo: 'Không có thông tin trợ lý',
      generalAssistance: 'Hỗ trợ chung',
      generalAssistant: 'Trợ lý chung',
      profile: 'Hồ sơ',
      error: 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
      about: 'Giới thiệu',
      specialty: 'Chuyên môn',
      topics: 'Chủ đề',
      loadingTopics: 'Đang tải chủ đề...',
      failedToLoadData: 'Không thể tải dữ liệu cuộc trò chuyện',
      category: 'Danh mục',
      count: 'Số lượng',
      loadingCanvas: 'Đang tải Canvas...',
      noTasksAvailable: 'Không có nhiệm vụ cuộc trò chuyện',
      noTasksDescription: 'Hiện tại không có nhiệm vụ nào cho cuộc trò chuyện này. Nhiệm vụ có thể được thêm vào khi cuộc trò chuyện tiến triển.',
      conversationTasks: 'Nhiệm vụ cuộc trò chuyện',
      goal: 'Mục tiêu',
      step: 'Bước',
      taskDetails: 'Chi tiết nhiệm vụ',
      status: 'Trạng thái',
      failedToLoadConversationData: 'Không thể tải dữ liệu cuộc trò chuyện',
      generalTopic: 'Chủ đề chung',
      mentoringTopics: 'Chủ đề hướng dẫn',
      privateTopics: 'Chủ đề riêng tư',
      archivedTopics: 'Chủ đề đã lưu trữ',
      categoryTopics: 'Chủ đề {{category}}',
      noConversationsFound: 'Không tìm thấy cuộc trò chuyện nào'
    },
    buyCredits: {
      title: 'Mua tín dụng',
      loadError: 'Không thể tải gói tín dụng. Vui lòng thử lại.',
      selectPackage: 'Vui lòng chọn một gói',
      createOrderError: 'Không thể tạo đơn hàng thanh toán. Vui lòng thử lại.',
      paymentSuccess: 'Thanh toán thành công! {{credits}} tín dụng đã được thêm vào tài khoản của bạn.',
      paymentProcessingError: 'Xử lý thanh toán thất bại. Vui lòng liên hệ hỗ trợ nếu bạn đã bị tính phí.',
      paymentError: 'Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
      enterVoucherCode: 'Vui lòng nhập mã voucher',
      voucherSuccess: 'Đổi voucher thành công! {{credits}} tín dụng đã được thêm vào tài khoản của bạn.',
      voucherError: 'Không thể đổi voucher',
      voucherRedeemError: 'Không thể đổi voucher. Vui lòng thử lại.',
      voucherRedeemed: 'Đã đổi voucher thành công!',
      voucherRedeemFailCheck: 'Không thể đổi voucher. Vui lòng kiểm tra mã và thử lại.',
      paymentSuccessful: 'Thanh toán thành công!',
      makeAnotherPurchase: 'Thực hiện giao dịch khác',
      choosePackage: 'Chọn gói tín dụng của bạn',
      description: 'Mua tín dụng để mở khóa tính năng cao cấp và khả năng nâng cao',
      haveAVoucherCode: 'Có mã voucher?',
      redeemVoucherCode: 'Đổi mã voucher của bạn để nhận tín dụng miễn phí ngay lập tức',
      voucherPlaceholder: 'Nhập mã voucher (ví dụ: EDVARA-123456)',
      redeem: 'Đổi',
      redeeming: 'Đang đổi...',
      redeemed: 'Đã đổi!',
      redeemVoucher: 'Đổi Voucher',
      purchaseCredits: 'Mua tín dụng',
      loadingPackages: 'Đang tải gói...',
      completePurchase: 'Hoàn tất giao dịch của bạn',
      purchasingCredits: 'Bạn đang mua {{credits}} tín dụng với giá ${{price}}',
      capturingPayment: 'Đang ghi nhận thanh toán...',
      processingPayment: 'Đang xử lý thanh toán...',
      paymentFailed: 'Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
      cancel: 'Hủy',
      paymentCancelled: 'Đã hủy thanh toán',
      securePayment: ' Xử lý thanh toán an toàn được cung cấp bởi PayPal',
      encryptedInfo: 'Thông tin thanh toán của bạn được mã hóa và bảo vệ'
    }
  },
};

export default viTranslation;

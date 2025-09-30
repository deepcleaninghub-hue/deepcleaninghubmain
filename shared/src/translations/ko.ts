// Korean translations - using English as fallback for now
export const ko = {
  common: {
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    cancel: '취소',
    ok: '확인',
    save: '저장',
    delete: '삭제',
    edit: '편집',
    add: '추가',
    remove: '제거',
    confirm: '확인',
    retry: '다시 시도',
    back: '뒤로',
    next: '다음',
    previous: '이전',
    done: '완료',
    close: '닫기',
    search: '검색',
    filter: '필터',
    clear: '지우기',
    select: '선택',
    all: '모두',
    none: '없음',
    yes: '예',
    no: '아니오',
  },
  auth: {
    login: '로그인',
    signup: '회원가입',
    logout: '로그아웃',
    email: '이메일',
    password: '비밀번호',
    confirmPassword: '비밀번호 확인',
    forgotPassword: '비밀번호를 잊으셨나요?',
    rememberMe: '로그인 상태 유지',
    createAccount: '계정 만들기',
    alreadyHaveAccount: '이미 계정이 있으신가요?',
    dontHaveAccount: '계정이 없으신가요?',
    loginSuccess: '로그인 성공',
    loginFailed: '로그인 실패',
    signupSuccess: '계정 생성 성공',
    signupFailed: '계정 생성 실패',
    emailRequired: '이메일이 필요합니다',
    passwordRequired: '비밀번호가 필요합니다',
    invalidEmail: '유효한 이메일 주소를 입력하세요',
    passwordTooShort: '비밀번호는 최소 6자 이상이어야 합니다',
    passwordsDoNotMatch: '비밀번호가 일치하지 않습니다',},
  profile: {
    title: '프로필',
    editProfile: '프로필 편집',
    changePassword: '비밀번호 변경',
    myOrders: '내 주문',
    browseServices: '서비스 둘러보기',
    rateApp: '앱 평가',
    changeLanguage: '언어 변경',
    deleteAccount: '계정 삭제',
    quickActions: '빠른 작업',
    loadingProfile: '프로필 로딩 중...',
    guestUser: '게스트 사용자',
    noEmail: '이메일 없음',
    logoutConfirm: '로그아웃하시겠습니까?',
    passwordChanged: '비밀번호가 성공적으로 변경되었습니다',
    currentPassword: '현재 비밀번호',
    newPassword: '새 비밀번호',
    confirmNewPassword: '새 비밀번호 확인',
    changingPassword: '변경 중...',
    deleteAccountStep1: '⚠️ 계정 삭제 - 1단계/2단계',
    deleteAccountStep2: '🗑️ 계정 삭제 - 2단계/2단계',
    deleteAccountWarning: '이 작업은 계정과 모든 관련 데이터를 영구적으로 삭제합니다:\n\n• 모든 예약 및 주문\n• 개인 정보\n• 결제 내역\n• 계정 설정\n\n이 작업은 되돌릴 수 없습니다.\n\n계속하시겠습니까?',
    deleteAccountFinal: '최종 경고: 계정을 영구적으로 삭제하려고 합니다.\n\n확인하려면 아래 텍스트 필드에 "삭제"를 입력하고 "영구 삭제"를 탭하세요.',
    typeDeleteToConfirm: '계정을 영구적으로 삭제하려면 "삭제"를 정확히 입력하세요:',
    deleteForever: '영구 삭제',
    invalidConfirmation: '"삭제"를 정확히 입력해야 합니다. 계정 삭제가 취소되었습니다.',
    accountDeleted: '계정이 영구적으로 삭제되었습니다. 이 기능은 백엔드 API로 구현됩니다.',
    iUnderstandContinue: '이해했습니다, 계속',
    typeDeleteToConfirmButton: '삭제 입력하여 확인',
    profileCompletion: '프로필 완성도',
    personalInformation: '개인 정보',
    firstName: '이름',
    lastName: '성',
    email: '이메일',
    phone: '전화번호',
    dateOfBirth: '생년월일',
    male: '남성',
    female: '여성',
    other: '기타',
    preferNotToSay: '말하고 싶지 않음',
    addressInformation: '주소 정보',
    address: '주소',
    city: '도시',
    state: '주/도',
    postalCode: '우편번호',
    country: '국가',
    saveProfile: '프로필 저장',
    saving: '저장 중...',
    firstNameCannotBeEmpty: '이름은 비어있을 수 없습니다',
    lastNameCannotBeEmpty: '성은 비어있을 수 없습니다',
    emailCannotBeEmpty: '이메일은 비어있을 수 없습니다',
    pleaseEnterValidEmail: '유효한 이메일 주소를 입력하세요',
    phoneNumberMustBeAtLeast10: '전화번호는 최소 10자 이상이어야 합니다',
    addressMustBeAtLeast5: '주소는 최소 5자 이상이어야 합니다',
    cityMustBeAtLeast2: '도시는 최소 2자 이상이어야 합니다',
    postalCodeMustBeAtLeast3: '우편번호는 최소 3자 이상이어야 합니다',
    dateOfBirthCannotBeInFuture: '생년월일은 미래 날짜가 될 수 없습니다',
    deleteAccountStep1Title: '⚠️ 계정 삭제 - 1단계/2단계',
    deleteAccountStep1Message: '이 작업은 계정과 관련된 모든 데이터를 영구적으로 삭제합니다:\n\n• 모든 예약 및 주문\n• 개인 정보\n• 결제 내역\n• 계정 설정\n\n이 작업은 되돌릴 수 없습니다.\n\n계속하시겠습니까?',},
  services: {
    title: '서비스',
    browseServices: '서비스 둘러보기',
    allServices: '모든 서비스',
    categories: '카테고리',
    searchServices: '서비스 검색...',
    noServicesFound: '서비스를 찾을 수 없습니다',
    loadingServices: '서비스 로딩 중...',
    addToCart: '장바구니에 추가',
    removeFromCart: '장바구니에서 제거',
    inCart: '장바구니에 있음',
    from: '부터',
    per: '당',
    optionsAvailable: '옵션 사용 가능',
    duration: '소요 시간',
    features: '기능',
    price: '가격',
    total: '총합',
    quantity: '수량',
    distance: '거리',
    enterDistance: '거리를 km로 입력',
    calculation: '계산',
    basePrice: '기본 가격',
    distancePrice: '거리 가격',
    totalPrice: '총 가격',
    bookNow: '지금 예약',
    selectOptions: '옵션 선택',
    repeatLastBooking: '마지막 예약 반복',
    today: '오늘',
    tomorrow: '내일',
    repeatLastBookingComingSoon: '마지막 예약 반복 기능이 곧 출시됩니다!',
    todaySchedulingComingSoon: '오늘 일정 기능이 곧 출시됩니다!',
    tomorrowSchedulingComingSoon: '내일 일정 기능이 곧 출시됩니다!',
    customQuotesFast: '맞춤 견적, 빠름',
    needTailoredEstimate: '맞춤 견적이 필요하신가요?',
    tellUsRequirements: '요구사항을 알려주시면 몇 분 내에 답변드리겠습니다.',
    getQuote: '견적 받기',
    call: '전화',
    help: '도움말',
    noServiceOptionsFound: '서비스 옵션을 찾을 수 없습니다',
    noOptionsAvailableFor: '사용 가능한 옵션이 없습니다',
    serviceOptions: '서비스 옵션',
    recommendedForYou: '추천',},
  cart: {
    title: '장바구니',
    empty: '장바구니가 비어있습니다',
    items: '아이템',
    total: '총합',
    checkout: '결제하기',
    removeItem: '아이템 제거',
    updateQuantity: '수량 업데이트',
    clearCart: '장바구니 비우기',
    continueShopping: '쇼핑 계속하기',    loginToAddItems: '장바구니에 상품을 추가하려면 로그인하세요',
    alreadyInCart: '이미 장바구니에 있음',

    alreadyInCartMessage: '이(가) 이미 장바구니에 있습니다.',


    addedToCart: '장바구니에 추가되었습니다!',



    failedToAddItem: '장바구니에 상품 추가 실패',




    failedToRemoveItem: '장바구니에서 상품 제거 실패',





    failedToUpdateQuantity: '수량 업데이트 실패',






    clearedSuccessfully: '장바구니가 성공적으로 비워졌습니다',







    failedToClearCart: '장바구니 비우기 실패',








    service: '서비스',









    twoHours: '2시간',










    qty: '수량',











},
  orders: {
    title: '주문',
    myOrders: '내 주문',
    noOrders: '주문을 찾을 수 없습니다',
    orderNumber: '주문 번호',
    status: '상태',
    date: '날짜',
    total: '총합',
    viewDetails: '세부 정보 보기',
    trackOrder: '주문 추적',
    cancelOrder: '주문 취소',
    reorder: '재주문',
    orderStatus: '주문 상태',
    bookingPlaced: '예약 완료',
    orderPlaced: '주문 완료',
    confirmed: '확인됨',
    inProgress: '진행 중',
    serviceProvider: '서비스 제공자',
    serviceDate: '서비스 날짜',
    serviceTime: '서비스 시간',
    totalAmount: '총 금액',
    serviceAddress: '서비스 주소',
    duration: '소요 시간:',
    minutes: '분',
    contactSupport: '고객 지원 연락',
    bookingNumber: '예약 #',
    loadingOrderDetails: '주문 세부사항 로딩 중...',
    failedToLoadOrderDetails: '주문 세부사항 로딩 실패',
    cancelBooking: '예약 취소',
    cancelBookingConfirm: '이 예약을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    cancelOrderConfirm: '이 주문을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    yesCancel: '예, 취소',
    bookingCancelledSuccess: '예약이 성공적으로 취소되었습니다',
    orderCancelledSuccess: '주문이 성공적으로 취소되었습니다',
    failedToCancelBooking: '예약 취소 실패',
    failedToCancelOrder: '주문 취소 실패',
    reschedule: '재예약',
    rescheduleComingSoon: '재예약 기능이 곧 제공됩니다!',},
  contact: {
    title: '문의하기',
    contactUs: '문의하기',
    getInTouch: '연락하기',
    contactDescription: '질문이 있거나 도움이 필요하신가요? 도움을 드리겠습니다.',
    fullName: '전체 이름',
    emailAddress: '이메일 주소',
    phoneNumber: '전화번호',
    serviceRequired: '필요한 서비스',
    message: '메시지',
    serviceArea: '서비스 지역',
    preferredDate: '선호 날짜',
    sendMessage: '메시지 보내기',
    callUs: '전화하기',
    emailUs: '이메일 보내기',
    whatsappUs: 'WhatsApp으로 연락',
    contactMethods: '연락 방법',
    phone: '전화',
    email: '이메일',
    whatsapp: 'WhatsApp',
  },
  navigation: {
    home: '홈',
    services: '서비스',
    cart: '장바구니',
    orders: '주문',
    profile: '프로필',
    contact: '문의하기',
  },
  errors: {
    somethingWentWrong: '앗! 뭔가 잘못되었습니다',
    unexpectedError: '죄송합니다. 예상치 못한 일이 발생했습니다. 다시 시도해 주세요.',
    networkError: '네트워크 오류. 연결을 확인해 주세요.',
    serverError: '서버 오류. 나중에 다시 시도해 주세요.',
    notFound: '찾을 수 없음',
    unauthorized: '인증되지 않은 접근',
    forbidden: '접근 금지',
    validationError: '입력을 확인하고 다시 시도해 주세요.',
    errorDetails: '오류 세부사항 (개발용만):',
  },
  language: {
    selectLanguage: '언어 선택',
    currentLanguage: '현재 언어',
    changeLanguage: '언어 변경',
    languageChanged: '언어가 성공적으로 변경되었습니다',
  },
  serviceCard: {
    // ServiceCard component keys
    numberOfItems: '항목 수',
    enterNumberOfItems: '항목 수 입력',
    enterAreaInM2: '면적을 m²로 입력',
    enterItemDetails: '항목 세부사항 입력',
    enterMeasurement: '측정값 입력',
    serviceTitle: '서비스 제목',
    serviceDescription: '서비스 설명',
    inCart: '장바구니에 있음',
    addToCart: '장바구니에 추가',
    items: '항목',
    area: '면적',
  },

};

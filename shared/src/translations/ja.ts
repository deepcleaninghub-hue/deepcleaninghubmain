// Japanese translations - using English as fallback for now
export const ja = {
  common: {
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    cancel: 'キャンセル',
    ok: 'OK',
    save: '保存',
    delete: '削除',
    edit: '編集',
    add: '追加',
    remove: '削除',
    confirm: '確認',
    retry: '再試行',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    done: '完了',
    close: '閉じる',
    search: '検索',
    filter: 'フィルター',
    clear: 'クリア',
    select: '選択',
    all: 'すべて',
    none: 'なし',
    yes: 'はい',
    no: 'いいえ',
  },
  auth: {
    login: 'ログイン',
    signup: 'サインアップ',
    logout: 'ログアウト',
    email: 'メール',
    password: 'パスワード',
    confirmPassword: 'パスワード確認',
    forgotPassword: 'パスワードを忘れましたか？',
    rememberMe: 'ログイン状態を保持',
    createAccount: 'アカウント作成',
    alreadyHaveAccount: 'すでにアカウントをお持ちですか？',
    dontHaveAccount: 'アカウントをお持ちでないですか？',
    loginSuccess: 'ログイン成功',
    loginFailed: 'ログイン失敗',
    signupSuccess: 'アカウント作成成功',
    signupFailed: 'アカウント作成失敗',
    emailRequired: 'メールアドレスが必要です',
    passwordRequired: 'パスワードが必要です',
    invalidEmail: '有効なメールアドレスを入力してください',
    passwordTooShort: 'パスワードは6文字以上である必要があります',
    passwordsDoNotMatch: 'パスワードが一致しません',},
  profile: {
    title: 'プロフィール',
    editProfile: 'プロフィール編集',
    changePassword: 'パスワード変更',
    myOrders: 'マイオーダー',
    browseServices: 'サービス閲覧',
    rateApp: 'アプリ評価',
    changeLanguage: '言語変更',
    deleteAccount: 'アカウント削除',
    quickActions: 'クイックアクション',
    loadingProfile: 'プロフィール読み込み中...',
    guestUser: 'ゲストユーザー',
    noEmail: 'メールなし',
    logoutConfirm: 'ログアウトしてもよろしいですか？',
    passwordChanged: 'パスワード変更成功',
    currentPassword: '現在のパスワード',
    newPassword: '新しいパスワード',
    confirmNewPassword: '新しいパスワード確認',
    changingPassword: '変更中...',
    deleteAccountStep1: '⚠️ アカウント削除 - ステップ1/2',
    deleteAccountStep2: '🗑️ アカウント削除 - ステップ2/2',
    deleteAccountWarning: 'この操作により、アカウントとすべての関連データが永続的に削除されます：\n\n• すべての予約と注文\n• 個人情報\n• 支払い履歴\n• アカウント設定\n\nこの操作は元に戻せません。\n\n続行してもよろしいですか？',
    deleteAccountFinal: '最終警告：アカウントを永続的に削除しようとしています。\n\n確認するには、下のテキストフィールドに「削除」と入力し、「永久削除」をタップしてください。',
    typeDeleteToConfirm: 'アカウントを永続的に削除するには「削除」と正確に入力してください：',
    deleteForever: '永久削除',
    invalidConfirmation: '「削除」と正確に入力する必要があります。アカウント削除がキャンセルされました。',
    accountDeleted: 'アカウントが永続的に削除されました。この機能はバックエンドAPIで実装されます。',
    iUnderstandContinue: '理解しました、続行',
    typeDeleteToConfirmButton: '削除と入力して確認',
    profileCompletion: 'プロフィール完成度',
    personalInformation: '個人情報',
    firstName: '名',
    lastName: '姓',
    email: 'メールアドレス',
    phone: '電話番号',
    dateOfBirth: '生年月日',
    male: '男性',
    female: '女性',
    other: 'その他',
    preferNotToSay: '回答したくない',
    addressInformation: '住所情報',
    address: '住所',
    city: '市区町村',
    state: '都道府県',
    postalCode: '郵便番号',
    country: '国',
    saveProfile: 'プロフィールを保存',
    saving: '保存中...',
    firstNameCannotBeEmpty: '名は空にできません',
    lastNameCannotBeEmpty: '姓は空にできません',
    emailCannotBeEmpty: 'メールアドレスは空にできません',
    pleaseEnterValidEmail: '有効なメールアドレスを入力してください',
    phoneNumberMustBeAtLeast10: '電話番号は10文字以上である必要があります',
    addressMustBeAtLeast5: '住所は5文字以上である必要があります',
    cityMustBeAtLeast2: '市区町村は2文字以上である必要があります',
    postalCodeMustBeAtLeast3: '郵便番号は3文字以上である必要があります',
    dateOfBirthCannotBeInFuture: '生年月日は未来の日付にできません',
    deleteAccountStep1Title: '⚠️ アカウント削除 - ステップ1/2',
    deleteAccountStep1Message: 'この操作により、アカウントと関連するすべてのデータが永続的に削除されます：\n\n• すべての予約と注文\n• 個人情報\n• 支払い履歴\n• アカウント設定\n\nこの操作は元に戻せません。\n\n続行してもよろしいですか？',},
  services: {
    title: 'サービス',
    browseServices: 'サービス閲覧',
    allServices: 'すべてのサービス',
    categories: 'カテゴリー',
    searchServices: 'サービス検索...',
    noServicesFound: 'サービスが見つかりません',
    loadingServices: 'サービス読み込み中...',
    addToCart: 'カートに追加',
    removeFromCart: 'カートから削除',
    inCart: 'カート内',
    from: 'から',
    per: 'あたり',
    optionsAvailable: 'オプション利用可能',
    duration: '期間',
    features: '機能',
    price: '価格',
    total: '合計',
    quantity: '数量',
    distance: '距離',
    enterDistance: '距離をkmで入力',
    calculation: '計算',
    basePrice: '基本価格',
    distancePrice: '距離価格',
    totalPrice: '合計価格',
    bookNow: '今すぐ予約',
    selectOptions: 'オプション選択',
    repeatLastBooking: '最後の予約を繰り返す',
    today: '今日',
    tomorrow: '明日',
    repeatLastBookingComingSoon: '最後の予約を繰り返す機能がまもなく利用可能になります！',
    todaySchedulingComingSoon: '今日のスケジュール機能がまもなく利用可能になります！',
    tomorrowSchedulingComingSoon: '明日のスケジュール機能がまもなく利用可能になります！',
    customQuotesFast: 'カスタム見積もり、迅速',
    needTailoredEstimate: 'カスタム見積もりが必要ですか？',
    tellUsRequirements: 'ご要件をお聞かせください。数分以内にご返答いたします。',
    getQuote: '見積もりを取得',
    call: '電話する',
    help: 'ヘルプ',
    noServiceOptionsFound: 'サービスオプションが見つかりません',
    noOptionsAvailableFor: '利用可能なオプションがありません',
    serviceOptions: 'サービスオプション',
    recommendedForYou: 'おすすめ',},
  cart: {
    title: 'カート',
    empty: 'カートが空です',
    items: 'アイテム',
    total: '合計',
    checkout: 'チェックアウト',
    removeItem: 'アイテム削除',
    updateQuantity: '数量更新',
    clearCart: 'カートを空にする',
    continueShopping: 'ショッピングを続ける',    loginToAddItems: 'カートに商品を追加するにはログインしてください',
    alreadyInCart: 'すでにカートにあります',

    alreadyInCartMessage: 'はすでにカートにあります。',


    addedToCart: 'がカートに追加されました！',



    failedToAddItem: 'カートに商品を追加できませんでした',




    failedToRemoveItem: 'カートから商品を削除できませんでした',





    failedToUpdateQuantity: '数量の更新に失敗しました',






    clearedSuccessfully: 'カートが正常にクリアされました',







    failedToClearCart: 'カートのクリアに失敗しました',








    service: 'サービス',









    twoHours: '2時間',










    qty: '数量',











},
  orders: {
    title: '注文',
    myOrders: 'マイオーダー',
    noOrders: '注文が見つかりません',
    orderNumber: '注文番号',
    status: 'ステータス',
    date: '日付',
    total: '合計',
    viewDetails: '詳細表示',
    trackOrder: '注文追跡',
    cancelOrder: '注文キャンセル',
    reorder: '再注文',
    orderStatus: '注文ステータス',
    bookingPlaced: '予約完了',
    orderPlaced: '注文完了',
    confirmed: '確認済み',
    inProgress: '進行中',
    serviceProvider: 'サービス提供者',
    serviceDate: 'サービス日',
    serviceTime: 'サービス時間',
    totalAmount: '合計金額',
    serviceAddress: 'サービス住所',
    duration: '所要時間：',
    minutes: '分',
    contactSupport: 'サポートに連絡',
    bookingNumber: '予約 #',
    loadingOrderDetails: '注文詳細を読み込み中...',
    failedToLoadOrderDetails: '注文詳細の読み込みに失敗しました',
    cancelBooking: '予約をキャンセル',
    cancelBookingConfirm: 'この予約をキャンセルしてもよろしいですか？この操作は元に戻せません。',
    cancelOrderConfirm: 'この注文をキャンセルしてもよろしいですか？この操作は元に戻せません。',
    yesCancel: 'はい、キャンセル',
    bookingCancelledSuccess: '予約が正常にキャンセルされました',
    orderCancelledSuccess: '注文が正常にキャンセルされました',
    failedToCancelBooking: '予約のキャンセルに失敗しました',
    failedToCancelOrder: '注文のキャンセルに失敗しました',
    reschedule: '再スケジュール',
    rescheduleComingSoon: '再スケジュール機能が間もなく利用可能になります！',},
  contact: {
    title: 'お問い合わせ',
    contactUs: 'お問い合わせ',
    getInTouch: 'お問い合わせ',
    contactDescription: 'ご質問やお手伝いが必要ですか？お手伝いいたします。',
    fullName: 'フルネーム',
    emailAddress: 'メールアドレス',
    phoneNumber: '電話番号',
    serviceRequired: '必要なサービス',
    message: 'メッセージ',
    serviceArea: 'サービスエリア',
    preferredDate: '希望日',
    sendMessage: 'メッセージ送信',
    callUs: 'お電話ください',
    emailUs: 'メールしてください',
    whatsappUs: 'WhatsAppで連絡',
    contactMethods: '連絡方法',
    phone: '電話',
    email: 'メール',
    whatsapp: 'WhatsApp',
  },
  navigation: {
    home: 'ホーム',
    services: 'サービス',
    cart: 'カート',
    orders: '注文',
    profile: 'プロフィール',
    contact: 'お問い合わせ',
  },
  errors: {
    somethingWentWrong: 'おっと！何かが間違っています',
    unexpectedError: '申し訳ありませんが、予期しないことが発生しました。再試行してください。',
    networkError: 'ネットワークエラー。接続を確認してください。',
    serverError: 'サーバーエラー。後でもう一度お試しください。',
    notFound: '見つかりません',
    unauthorized: '認証されていません',
    forbidden: 'アクセス禁止',
    validationError: '入力を確認して再試行してください。',
    errorDetails: 'エラー詳細（開発のみ）：',
  },
  language: {
    selectLanguage: '言語選択',
    currentLanguage: '現在の言語',
    changeLanguage: '言語変更',
    languageChanged: '言語が正常に変更されました',
  },
  serviceCard: {
    // ServiceCard component keys
    numberOfItems: 'アイテム数',
    enterNumberOfItems: 'アイテム数を入力',
    enterAreaInM2: '面積をm²で入力',
    enterItemDetails: 'アイテム詳細を入力',
    enterMeasurement: '測定値を入力',
    serviceTitle: 'サービスタイトル',
    serviceDescription: 'サービス説明',
    inCart: 'カート内',
    addToCart: 'カートに追加',
    items: 'アイテム',
    area: '面積',
  },

};

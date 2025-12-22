import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation data with comprehensive coverage
const translations = {
  en: {
    // Navigation
    explore: 'Explore',
    search: 'Search',
    create: 'Create Post',
    messages: 'Messages',
    notifications: 'Notifications',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    home: 'Home',
    
    // Authentication
    signin: 'Sign In',
    signup: 'Sign Up',
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    forgotPassword: 'Forgot Password?',
    alreadyHaveAccount: 'Already have an account? Sign in',
    dontHaveAccount: "Don't have an account? Sign Up",
    
    // Posts
    recent: 'Recent',
    trending: 'Trending',
    popular: 'Popular',
    like: 'Like',
    likes: 'Likes',
    comment: 'Comment',
    comments: 'Comments',
    share: 'Share',
    delete: 'Delete',
    edit: 'Edit',
    post: 'Post',
    posts: 'Posts',
    title: 'Title',
    content: 'Content',
    tags: 'Tags',
    
    // Settings
    accountSettings: 'Account Settings',
    displayName: 'Display Name',
    emailAddress: 'Email Address',
    languagePreference: 'Language Preference',
    privacySecurity: 'Privacy & Security',
    notificationPreferences: 'Notification Preferences',
    allowDirectMessages: 'Allow Direct Messages',
    likesOnPosts: 'Likes on posts',
    commentsOnPosts: 'Comments on posts',
    newFollowers: 'New followers',
    mentions: 'Mentions',
    save: 'Save',
    deleteAccount: 'Delete Account',
    
    // Common
    loading: 'Loading...',
    cancel: 'Cancel',
    update: 'Update',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    
    // AI Assistant
    aiAssistant: 'AI Assistant',
    writeCaption: 'Write a caption',
    suggestTopics: 'Suggest topics',
    improveContent: 'Improve content',
    creativeIdeas: 'Creative ideas',
    
    // Chat
    chat: 'Chat',
    typeMessage: 'Type a message...',
    sendMessage: 'Send Message',
    
    // Notifications
    getNotified: 'Get notified when someone',
    likesYourPosts: 'likes your posts',
    commentsOnYourPosts: 'comments on your posts',
    followsYou: 'follows you',
    mentionsYou: 'mentions you',
  },
  
  hi: {
    // Navigation (Hindi)
    explore: 'खोजें',
    search: 'खोज',
    create: 'पोस्ट बनाएं',
    messages: 'संदेश',
    notifications: 'सूचनाएं',
    settings: 'सेटिंग्स',
    profile: 'प्रोफाइल',
    logout: 'लॉग आउट',
    home: 'होम',
    
    // Authentication
    signin: 'साइन इन',
    signup: 'साइन अप',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    firstName: 'पहला नाम',
    lastName: 'अंतिम नाम',
    forgotPassword: 'पासवर्ड भूल गए?',
    alreadyHaveAccount: 'पहले से खाता है? साइन इन करें',
    dontHaveAccount: 'खाता नहीं है? साइन अप करें',
    
    // Posts
    recent: 'हाल ही में',
    trending: 'ट्रेंडिंग',
    popular: 'लोकप्रिय',
    like: 'पसंद',
    likes: 'पसंद',
    comment: 'टिप्पणी',
    comments: 'टिप्पणियां',
    share: 'साझा करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    post: 'पोस्ट',
    posts: 'पोस्ट्स',
    title: 'शीर्षक',
    content: 'सामग्री',
    tags: 'टैग्स',
    
    // Settings
    accountSettings: 'खाता सेटिंग्स',
    displayName: 'प्रदर्शन नाम',
    emailAddress: 'ईमेल पता',
    languagePreference: 'भाषा प्राथमिकता',
    privacySecurity: 'गोपनीयता और सुरक्षा',
    notificationPreferences: 'सूचना प्राथमिकताएं',
    allowDirectMessages: 'प्रत्यक्ष संदेशों की अनुमति दें',
    likesOnPosts: 'पोस्ट पर पसंद',
    commentsOnPosts: 'पोस्ट पर टिप्पणियां',
    newFollowers: 'नए फॉलोअर्स',
    mentions: 'उल्लेख',
    save: 'सेव करें',
    deleteAccount: 'खाता हटाएं',
    
    // Common
    loading: 'लोड हो रहा है...',
    cancel: 'रद्द करें',
    update: 'अपडेट करें',
    submit: 'जमा करें',
    back: 'वापस',
    next: 'अगला',
    previous: 'पिछला',
    
    // AI Assistant
    aiAssistant: 'AI सहायक',
    writeCaption: 'कैप्शन लिखें',
    suggestTopics: 'विषय सुझाएं',
    improveContent: 'सामग्री में सुधार करें',
    creativeIdeas: 'रचनात्मक विचार',
    
    // Chat
    chat: 'चैट',
    typeMessage: 'संदेश टाइप करें...',
    sendMessage: 'संदेश भेजें',
    
    // Notifications
    getNotified: 'सूचना पाएं जब कोई',
    likesYourPosts: 'आपकी पोस्ट को पसंद करे',
    commentsOnYourPosts: 'आपकी पोस्ट पर टिप्पणी करे',
    followsYou: 'आपको फॉलो करे',
    mentionsYou: 'आपका उल्लेख करे',
  },
  
  es: {
    // Navigation (Spanish)
    explore: 'Explorar',
    search: 'Buscar',
    create: 'Crear Publicación',
    messages: 'Mensajes',
    notifications: 'Notificaciones',
    settings: 'Configuración',
    profile: 'Perfil',
    logout: 'Cerrar Sesión',
    home: 'Inicio',
    
    // Authentication
    signin: 'Iniciar Sesión',
    signup: 'Registrarse',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    firstName: 'Nombre',
    lastName: 'Apellido',
    forgotPassword: '¿Olvidaste tu contraseña?',
    alreadyHaveAccount: '¿Ya tienes cuenta? Inicia sesión',
    dontHaveAccount: '¿No tienes cuenta? Regístrate',
    
    // Posts
    recent: 'Reciente',
    trending: 'Tendencia',
    popular: 'Popular',
    like: 'Me Gusta',
    likes: 'Me Gusta',
    comment: 'Comentar',
    comments: 'Comentarios',
    share: 'Compartir',
    delete: 'Eliminar',
    edit: 'Editar',
    post: 'Publicación',
    posts: 'Publicaciones',
    title: 'Título',
    content: 'Contenido',
    tags: 'Etiquetas',
    
    // Settings
    accountSettings: 'Configuración de Cuenta',
    displayName: 'Nombre de Usuario',
    emailAddress: 'Dirección de Correo',
    languagePreference: 'Preferencia de Idioma',
    privacySecurity: 'Privacidad y Seguridad',
    notificationPreferences: 'Preferencias de Notificación',
    allowDirectMessages: 'Permitir Mensajes Directos',
    likesOnPosts: 'Me gusta en publicaciones',
    commentsOnPosts: 'Comentarios en publicaciones',
    newFollowers: 'Nuevos seguidores',
    mentions: 'Menciones',
    save: 'Guardar',
    deleteAccount: 'Eliminar Cuenta',
    
    // Common
    loading: 'Cargando...',
    cancel: 'Cancelar',
    update: 'Actualizar',
    submit: 'Enviar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    
    // AI Assistant
    aiAssistant: 'Asistente IA',
    writeCaption: 'Escribir subtítulo',
    suggestTopics: 'Sugerir temas',
    improveContent: 'Mejorar contenido',
    creativeIdeas: 'Ideas creativas',
    
    // Chat
    chat: 'Chat',
    typeMessage: 'Escribe un mensaje...',
    sendMessage: 'Enviar Mensaje',
    
    // Notifications
    getNotified: 'Recibe notificaciones cuando alguien',
    likesYourPosts: 'le guste tus publicaciones',
    commentsOnYourPosts: 'comente en tus publicaciones',
    followsYou: 'te siga',
    mentionsYou: 'te mencione',
  },
  
  // Bengali
  bn: {
    explore: 'অন্বেষণ',
    search: 'খোঁজ',
    create: 'পোস্ট তৈরি করুন',
    messages: 'বার্তা',
    notifications: 'বিজ্ঞপ্তি',
    settings: 'সেটিংস',
    profile: 'প্রোফাইল',
    logout: 'লগ আউট',
    home: 'হোম',
    signin: 'সাইন ইন',
    signup: 'সাইন আপ',
    email: 'ইমেইল',
    password: 'পাসওয়ার্ড',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    loading: 'লোড হচ্ছে...',
    accountSettings: 'অ্যাকাউন্ট সেটিংস',
    languagePreference: 'ভাষার পছন্দ',
  },
  
  // German
  de: {
    explore: 'Entdecken',
    search: 'Suchen',
    create: 'Beitrag erstellen',
    messages: 'Nachrichten',
    notifications: 'Benachrichtigungen',
    settings: 'Einstellungen',
    profile: 'Profil',
    logout: 'Abmelden',
    home: 'Startseite',
    signin: 'Anmelden',
    signup: 'Registrieren',
    email: 'E-Mail',
    password: 'Passwort',
    save: 'Speichern',
    cancel: 'Abbrechen',
    loading: 'Wird geladen...',
    accountSettings: 'Kontoeinstellungen',
    languagePreference: 'Spracheinstellung',
  },
  
  // French
  fr: {
    explore: 'Explorer',
    search: 'Rechercher',
    create: 'Créer un Post',
    messages: 'Messages',
    notifications: 'Notifications',
    settings: 'Paramètres',
    profile: 'Profil',
    logout: 'Déconnexion',
    home: 'Accueil',
    signin: 'Se connecter',
    signup: 'S\'inscrire',
    email: 'E-mail',
    password: 'Mot de passe',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    loading: 'Chargement...',
    accountSettings: 'Paramètres du compte',
    languagePreference: 'Préférence de langue',
  },
  
  // Italian
  it: {
    explore: 'Esplora',
    search: 'Cerca',
    create: 'Crea Post',
    messages: 'Messaggi',
    notifications: 'Notifiche',
    settings: 'Impostazioni',
    profile: 'Profilo',
    logout: 'Disconnetti',
    home: 'Home',
    signin: 'Accedi',
    signup: 'Registrati',
    email: 'Email',
    password: 'Password',
    save: 'Salva',
    cancel: 'Annulla',
    loading: 'Caricamento...',
    accountSettings: 'Impostazioni Account',
    languagePreference: 'Preferenza Lingua',
  },
  
  // Portuguese
  pt: {
    explore: 'Explorar',
    search: 'Pesquisar',
    create: 'Criar Post',
    messages: 'Mensagens',
    notifications: 'Notificações',
    settings: 'Configurações',
    profile: 'Perfil',
    logout: 'Sair',
    home: 'Início',
    signin: 'Entrar',
    signup: 'Cadastrar',
    email: 'Email',
    password: 'Senha',
    save: 'Salvar',
    cancel: 'Cancelar',
    loading: 'Carregando...',
    accountSettings: 'Configurações da Conta',
    languagePreference: 'Preferência de Idioma',
  },
  
  // Russian
  ru: {
    explore: 'Исследовать',
    search: 'Поиск',
    create: 'Создать пост',
    messages: 'Сообщения',
    notifications: 'Уведомления',
    settings: 'Настройки',
    profile: 'Профиль',
    logout: 'Выйти',
    home: 'Главная',
    signin: 'Войти',
    signup: 'Регистрация',
    email: 'Электронная почта',
    password: 'Пароль',
    save: 'Сохранить',
    cancel: 'Отмена',
    loading: 'Загрузка...',
    accountSettings: 'Настройки аккаунта',
    languagePreference: 'Предпочтение языка',
  },
  
  // Add basic translations for other languages
  te: { explore: 'అన్వేషించు', search: 'వెతుకు', settings: 'సెట్టింగులు', home: 'హోమ్', save: 'సేవ్ చేయి' },
  mr: { explore: 'एक्सप्लोर', search: 'शोध', settings: 'सेटिंग्ज', home: 'होम', save: 'सेव्ह करा' },
  ta: { explore: 'ஆராய்', search: 'தேடு', settings: 'அமைப்புகள்', home: 'முகப்பு', save: 'சேமி' },
  gu: { explore: 'અન્વેષણ', search: 'શોધ', settings: 'સેટિંગ્સ', home: 'હોમ', save: 'સેવ કરો' },
  kn: { explore: 'ಅನ್ವೇಷಿಸು', search: 'ಹುಡುಕು', settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', home: 'ಮುಖಪುಟ', save: 'ಉಳಿಸು' },
  ja: { explore: '探索', search: '検索', settings: '設定', home: 'ホーム', save: '保存' },
  ko: { explore: '탐색', search: '검색', settings: '설정', home: '홈', save: '저장' },
  zh: { explore: '探索', search: '搜索', settings: '设置', home: '首页', save: '保存' },
  ar: { explore: 'استكشف', search: 'بحث', settings: 'الإعدادات', home: 'الرئيسية', save: 'حفظ' }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('ideaflux_language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (language) => {
    if (translations[language]) {
      setCurrentLanguage(language);
      localStorage.setItem('ideaflux_language', language);
    }
  };

  const t = (key) => {
    return translations[currentLanguage][key] || translations.en[key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: [
      // English
      { code: 'en', name: 'English', flag: '🇺🇸' },
      
      // Indian Languages
      { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
      { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇧🇩' },
      { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
      { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
      { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
      { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
      { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
      
      // International Languages
      { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
      { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
      { code: 'it', name: 'Italiano (Italian)', flag: '🇮🇹' },
      { code: 'pt', name: 'Português (Portuguese)', flag: '🇵🇹' },
      { code: 'ru', name: 'Русский (Russian)', flag: '🇷🇺' },
      { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
      { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' },
      { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
      { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
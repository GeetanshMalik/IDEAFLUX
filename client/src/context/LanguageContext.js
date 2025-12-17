import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation data
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
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    update: 'Update',
    
    // AI Assistant
    aiAssistant: 'AI Assistant',
    writeCaption: 'Write a caption',
    suggestTopics: 'Suggest topics',
    improveContent: 'Improve content',
    creativeIdeas: 'Creative ideas',
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    privacy: 'Privacy',
    account: 'Account',
  },
  es: {
    // Navigation
    explore: 'Explorar',
    search: 'Buscar',
    create: 'Crear Publicación',
    messages: 'Mensajes',
    notifications: 'Notificaciones',
    settings: 'Configuración',
    profile: 'Perfil',
    logout: 'Cerrar Sesión',
    
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
    
    // Common
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    update: 'Actualizar',
    
    // AI Assistant
    aiAssistant: 'Asistente IA',
    writeCaption: 'Escribir subtítulo',
    suggestTopics: 'Sugerir temas',
    improveContent: 'Mejorar contenido',
    creativeIdeas: 'Ideas creativas',
    
    // Settings
    language: 'Idioma',
    theme: 'Tema',
    privacy: 'Privacidad',
    account: 'Cuenta',
  },
  fr: {
    // Navigation
    explore: 'Explorer',
    search: 'Rechercher',
    create: 'Créer un Post',
    messages: 'Messages',
    notifications: 'Notifications',
    settings: 'Paramètres',
    profile: 'Profil',
    logout: 'Déconnexion',
    
    // Posts
    recent: 'Récent',
    trending: 'Tendance',
    popular: 'Populaire',
    like: 'J\'aime',
    likes: 'J\'aime',
    comment: 'Commenter',
    comments: 'Commentaires',
    share: 'Partager',
    delete: 'Supprimer',
    
    // Common
    loading: 'Chargement...',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    edit: 'Modifier',
    update: 'Mettre à jour',
    
    // AI Assistant
    aiAssistant: 'Assistant IA',
    writeCaption: 'Écrire une légende',
    suggestTopics: 'Suggérer des sujets',
    improveContent: 'Améliorer le contenu',
    creativeIdeas: 'Idées créatives',
    
    // Settings
    language: 'Langue',
    theme: 'Thème',
    privacy: 'Confidentialité',
    account: 'Compte',
  }
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
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
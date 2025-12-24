import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'ro' | 'fr' | 'de' | 'es';

const LANGUAGE_KEY = 'app_language';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Auth
  login: { en: 'Login', ro: 'Autentificare', fr: 'Connexion', de: 'Anmelden', es: 'Iniciar sesión' },
  signUp: { en: 'Sign Up', ro: 'Înregistrare', fr: "S'inscrire", de: 'Registrieren', es: 'Registrarse' },
  createAccount: { en: 'Create Account', ro: 'Creează cont', fr: 'Créer un compte', de: 'Konto erstellen', es: 'Crear cuenta' },
  username: { en: 'Username', ro: 'Nume utilizator', fr: "Nom d'utilisateur", de: 'Benutzername', es: 'Nombre de usuario' },
  firstName: { en: 'First Name', ro: 'Prenume', fr: 'Prénom', de: 'Vorname', es: 'Nombre' },
  lastName: { en: 'Last Name', ro: 'Nume', fr: 'Nom', de: 'Nachname', es: 'Apellido' },
  email: { en: 'Email', ro: 'Email', fr: 'Email', de: 'E-Mail', es: 'Correo electrónico' },
  password: { en: 'Password', ro: 'Parolă', fr: 'Mot de passe', de: 'Passwort', es: 'Contraseña' },
  birthday: { en: 'Birthday', ro: 'Data nașterii', fr: 'Date de naissance', de: 'Geburtstag', es: 'Fecha de nacimiento' },
  alreadyHaveAccount: { en: 'Already have an account? Login', ro: 'Ai deja cont? Autentifică-te', fr: 'Vous avez déjà un compte? Connectez-vous', de: 'Bereits ein Konto? Anmelden', es: '¿Ya tienes cuenta? Inicia sesión' },
  noAccount: { en: "Don't have an account? Sign up", ro: 'Nu ai cont? Înregistrează-te', fr: "Vous n'avez pas de compte? Inscrivez-vous", de: 'Kein Konto? Registrieren', es: '¿No tienes cuenta? Regístrate' },
  accountCreated: { en: 'Account created! Please login with your credentials.', ro: 'Cont creat! Te rugăm să te autentifici.', fr: 'Compte créé! Veuillez vous connecter.', de: 'Konto erstellt! Bitte melden Sie sich an.', es: '¡Cuenta creada! Por favor inicia sesión.' },
  fillAllFields: { en: 'Please fill in all fields', ro: 'Te rugăm să completezi toate câmpurile', fr: 'Veuillez remplir tous les champs', de: 'Bitte füllen Sie alle Felder aus', es: 'Por favor completa todos los campos' },
  fillEmailPassword: { en: 'Please fill in email and password', ro: 'Te rugăm să completezi email și parolă', fr: 'Veuillez remplir email et mot de passe', de: 'Bitte E-Mail und Passwort eingeben', es: 'Por favor completa email y contraseña' },

  // Language Selector
  selectLanguage: { en: 'Select Your Language', ro: 'Selectează limba', fr: 'Sélectionnez votre langue', de: 'Wählen Sie Ihre Sprache', es: 'Selecciona tu idioma' },
  continue: { en: 'Continue', ro: 'Continuă', fr: 'Continuer', de: 'Weiter', es: 'Continuar' },

  // Quizzes
  readyForChallenge: { en: 'Ready for a new challenge?', ro: 'Gata pentru o nouă provocare?', fr: 'Prêt pour un nouveau défi?', de: 'Bereit für eine neue Herausforderung?', es: '¿Listo para un nuevo desafío?' },
  chooseQuiz: { en: 'Choose your quiz', ro: 'Alege quiz-ul', fr: 'Choisissez votre quiz', de: 'Wählen Sie Ihr Quiz', es: 'Elige tu quiz' },
  level: { en: 'Level', ro: 'Nivel', fr: 'Niveau', de: 'Stufe', es: 'Nivel' },
  dailyTask: { en: 'Daily Task', ro: 'Sarcina zilnică', fr: 'Tâche quotidienne', de: 'Tägliche Aufgabe', es: 'Tarea diaria' },
  quiz: { en: 'Quiz', ro: 'Quiz', fr: 'Quiz', de: 'Quiz', es: 'Quiz' },
  moreGames: { en: 'More Games', ro: 'Mai multe jocuri', fr: 'Plus de jeux', de: 'Weitere Spiele', es: 'Más juegos' },
  questions: { en: 'Questions', ro: 'Întrebări', fr: 'Questions', de: 'Fragen', es: 'Preguntas' },
  plays: { en: 'plays', ro: 'jocuri', fr: 'parties', de: 'Spiele', es: 'partidas' },
  home: { en: 'Home', ro: 'Acasă', fr: 'Accueil', de: 'Startseite', es: 'Inicio' },
  leaderboard: { en: 'Leaderboard', ro: 'Clasament', fr: 'Classement', de: 'Bestenliste', es: 'Clasificación' },
  bookmarks: { en: 'Bookmarks', ro: 'Marcaje', fr: 'Signets', de: 'Lesezeichen', es: 'Marcadores' },
  settings: { en: 'Settings', ro: 'Setări', fr: 'Paramètres', de: 'Einstellungen', es: 'Configuración' },

  // Settings
  account: { en: 'Account', ro: 'Cont', fr: 'Compte', de: 'Konto', es: 'Cuenta' },
  displayName: { en: 'Display name', ro: 'Nume afișat', fr: "Nom d'affichage", de: 'Anzeigename', es: 'Nombre para mostrar' },
  changePhoto: { en: 'Change photo', ro: 'Schimbă poza', fr: 'Changer la photo', de: 'Foto ändern', es: 'Cambiar foto' },
  preferences: { en: 'Preferences', ro: 'Preferințe', fr: 'Préférences', de: 'Einstellungen', es: 'Preferencias' },
  soundEffects: { en: 'Sound effects', ro: 'Efecte sonore', fr: 'Effets sonores', de: 'Soundeffekte', es: 'Efectos de sonido' },
  notifications: { en: 'Notifications', ro: 'Notificări', fr: 'Notifications', de: 'Benachrichtigungen', es: 'Notificaciones' },
  about: { en: 'About', ro: 'Despre', fr: 'À propos', de: 'Über', es: 'Acerca de' },
  memberSince: { en: 'Member since', ro: 'Membru din', fr: 'Membre depuis', de: 'Mitglied seit', es: 'Miembro desde' },
  logOut: { en: 'Log out', ro: 'Deconectare', fr: 'Déconnexion', de: 'Abmelden', es: 'Cerrar sesión' },
  language: { en: 'Language', ro: 'Limba', fr: 'Langue', de: 'Sprache', es: 'Idioma' },
  confirmNameChange: { en: 'Confirm Name Change', ro: 'Confirmă schimbarea numelui', fr: 'Confirmer le changement de nom', de: 'Namensänderung bestätigen', es: 'Confirmar cambio de nombre' },
  sureChangeName: { en: 'Are you sure you want to change your name to', ro: 'Ești sigur că vrei să schimbi numele în', fr: 'Êtes-vous sûr de vouloir changer votre nom en', de: 'Sind Sie sicher, dass Sie Ihren Namen ändern möchten in', es: '¿Estás seguro de que quieres cambiar tu nombre a' },
  cancel: { en: 'Cancel', ro: 'Anulează', fr: 'Annuler', de: 'Abbrechen', es: 'Cancelar' },
  confirm: { en: 'Confirm', ro: 'Confirmă', fr: 'Confirmer', de: 'Bestätigen', es: 'Confirmar' },
  on: { en: 'On', ro: 'Pornit', fr: 'Activé', de: 'Ein', es: 'Activado' },
  off: { en: 'Off', ro: 'Oprit', fr: 'Désactivé', de: 'Aus', es: 'Desactivado' },

  // Quiz screens
  back: { en: 'Back', ro: 'Înapoi', fr: 'Retour', de: 'Zurück', es: 'Atrás' },
  check: { en: 'Check', ro: 'Verifică', fr: 'Vérifier', de: 'Prüfen', es: 'Verificar' },
  next: { en: 'Next', ro: 'Următorul', fr: 'Suivant', de: 'Weiter', es: 'Siguiente' },
  finish: { en: 'Finish', ro: 'Finalizează', fr: 'Terminer', de: 'Beenden', es: 'Finalizar' },
  correct: { en: 'Corect! 🎉', ro: 'Corect! 🎉', fr: 'Correct! 🎉', de: 'Richtig! 🎉', es: '¡Correcto! 🎉' },
  incorrect: { en: 'Nu e corect. Încearcă din nou sau mergi mai departe.', ro: 'Nu e corect. Încearcă din nou sau mergi mai departe.', fr: "Ce n'est pas correct. Réessayez ou continuez.", de: 'Nicht richtig. Versuchen Sie es erneut oder fahren Sie fort.', es: 'No es correcto. Inténtalo de nuevo o continúa.' },
  yourResult: { en: 'Rezultatul tău', ro: 'Rezultatul tău', fr: 'Votre résultat', de: 'Ihr Ergebnis', es: 'Tu resultado' },
  answeredCorrect: { en: 'Ai răspuns corect la', ro: 'Ai răspuns corect la', fr: 'Vous avez répondu correctement à', de: 'Sie haben richtig geantwortet auf', es: 'Respondiste correctamente a' },
  outOf: { en: 'din', ro: 'din', fr: 'sur', de: 'von', es: 'de' },
  questionsLower: { en: 'întrebări', ro: 'întrebări', fr: 'questions', de: 'Fragen', es: 'preguntas' },
  earnedXP: { en: 'Ai câștigat', ro: 'Ai câștigat', fr: 'Vous avez gagné', de: 'Sie haben verdient', es: 'Ganaste' },
  xp: { en: 'XP', ro: 'XP', fr: 'XP', de: 'XP', es: 'XP' },
  seeMistakes: { en: 'Vezi greșelile', ro: 'Vezi greșelile', fr: 'Voir les erreurs', de: 'Fehler anzeigen', es: 'Ver errores' },
  wrongQuestions: { en: 'Întrebări greșite & explicații', ro: 'Întrebări greșite & explicații', fr: 'Questions incorrectes et explications', de: 'Falsche Fragen und Erklärungen', es: 'Preguntas incorrectas y explicaciones' },
  yourAnswer: { en: 'Răspunsul tău:', ro: 'Răspunsul tău:', fr: 'Votre réponse:', de: 'Ihre Antwort:', es: 'Tu respuesta:' },
  correctAnswer: { en: 'Răspuns corect:', ro: 'Răspuns corect:', fr: 'Bonne réponse:', de: 'Richtige Antwort:', es: 'Respuesta correcta:' },
  explanation: { en: 'Explicație:', ro: 'Explicație:', fr: 'Explication:', de: 'Erklärung:', es: 'Explicación:' },
  backToQuizzes: { en: 'Back to quizzes', ro: 'Înapoi la quiz-uri', fr: 'Retour aux quiz', de: 'Zurück zu den Quiz', es: 'Volver a los quiz' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (saved && ['en', 'ro', 'fr', 'de', 'es'].includes(saved)) {
          setLanguageState(saved as Language);
        }
      } catch {
        // ignore
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};


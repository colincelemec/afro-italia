// ============================================
// Chatbot FAQ — domande e risposte predefinite
// Ogni voce: id, keywords (per il matching), question/answer in it/fr/en.
// Il matching è case-insensitive e cerca le keyword nel testo utente.
// ============================================

export const FAQ = [
  {
    id: 'register-business',
    keywords: ['registr', 'aggiung', 'pubblica', 'inserire', 'add', 'publish', 'enregistr', 'ajout', 'inscrire', 'attività', 'business', 'activité', 'servizio', 'service'],
    question: {
      it: 'Come registro la mia attività?',
      fr: 'Comment enregistrer mon activité ?',
      en: 'How do I register my business?',
    },
    answer: {
      it: 'Per registrare la tua attività: 1) Accedi al tuo account (o creane uno), 2) Vai alla Dashboard e clicca su "Aggiungi attività", 3) Compila il modulo con nome, categoria, città, indirizzo e contatti, 4) Invia: il nostro team verificherà la tua attività e riceverai un\'email di conferma.',
      fr: 'Pour enregistrer votre activité : 1) Connectez-vous à votre compte (ou créez-en un), 2) Allez dans le tableau de bord et cliquez sur « Ajouter une activité », 3) Remplissez le formulaire avec le nom, la catégorie, la ville, l\'adresse et les contacts, 4) Envoyez : notre équipe vérifiera votre activité et vous recevrez un email de confirmation.',
      en: 'To register your business: 1) Log in to your account (or create one), 2) Go to your Dashboard and click "Add business", 3) Fill in the form with name, category, city, address and contacts, 4) Submit: our team will verify your business and you will receive a confirmation email.',
    },
    link: { path: '/add-service', label: { it: 'Aggiungi attività', fr: 'Ajouter une activité', en: 'Add business' } },
  },
  {
    id: 'search',
    keywords: ['cerca', 'trovare', 'ricerca', 'ristorante', 'parrucchier', 'negozio', 'search', 'find', 'restaurant', 'cherch', 'trouver', 'coiffeur', 'magasin', 'filtr'],
    question: {
      it: 'Come cerco un ristorante o un\'attività?',
      fr: 'Comment chercher un restaurant ou une activité ?',
      en: 'How do I search for a restaurant or business?',
    },
    answer: {
      it: 'Vai alla pagina "Attività": puoi cercare per nome nella barra di ricerca, filtrare per categoria (ristoranti, parrucchieri, negozi…) e per città, e ordinare per valutazione o numero di recensioni. Puoi anche passare alla vista mappa per vedere le attività vicino a te.',
      fr: 'Allez sur la page « Activités » : vous pouvez chercher par nom dans la barre de recherche, filtrer par catégorie (restaurants, coiffeurs, magasins…) et par ville, et trier par note ou nombre d\'avis. Vous pouvez aussi passer en vue carte pour voir les activités près de chez vous.',
      en: 'Go to the "Activities" page: you can search by name in the search bar, filter by category (restaurants, hairdressers, shops…) and by city, and sort by rating or number of reviews. You can also switch to the map view to see businesses near you.',
    },
    link: { path: '/activities', label: { it: 'Esplora le attività', fr: 'Explorer les activités', en: 'Explore businesses' } },
  },
  {
    id: 'reviews',
    keywords: ['recension', 'commento', 'valutazione', 'stelle', 'review', 'rating', 'avis', 'note', 'étoile', 'commentaire'],
    question: {
      it: 'Come lascio una recensione?',
      fr: 'Comment laisser un avis ?',
      en: 'How do I leave a review?',
    },
    answer: {
      it: 'Apri la pagina dell\'attività, vai alla scheda "Recensioni" e clicca su "Scrivi una recensione". Scegli un voto da 1 a 5 stelle e scrivi il tuo commento. Devi essere connesso per lasciare una recensione, e puoi lasciarne solo una per attività.',
      fr: 'Ouvrez la page de l\'activité, allez dans l\'onglet « Avis » et cliquez sur « Écrire un avis ». Choisissez une note de 1 à 5 étoiles et rédigez votre commentaire. Vous devez être connecté pour laisser un avis, et vous ne pouvez en laisser qu\'un par activité.',
      en: 'Open the business page, go to the "Reviews" tab and click "Write a review". Choose a rating from 1 to 5 stars and write your comment. You must be logged in to leave a review, and you can only leave one per business.',
    },
  },
  {
    id: 'favorites',
    keywords: ['preferit', 'salva', 'cuore', 'favorite', 'favori', 'save', 'heart', 'enregistrer'],
    question: {
      it: 'Come salvo un\'attività nei preferiti?',
      fr: 'Comment enregistrer une activité en favori ?',
      en: 'How do I save a business to favorites?',
    },
    answer: {
      it: 'Clicca sull\'icona a forma di cuore nella pagina di un\'attività. Ritroverai tutti i tuoi preferiti nella Dashboard, nella scheda "Preferiti". Devi essere connesso per usare questa funzione.',
      fr: 'Cliquez sur l\'icône en forme de cœur sur la page d\'une activité. Vous retrouverez tous vos favoris dans le tableau de bord, onglet « Favoris ». Vous devez être connecté pour utiliser cette fonction.',
      en: 'Click the heart icon on a business page. You will find all your favorites in the Dashboard, under the "Favorites" tab. You must be logged in to use this feature.',
    },
    link: { path: '/dashboard', label: { it: 'Vai alla Dashboard', fr: 'Aller au tableau de bord', en: 'Go to Dashboard' } },
  },
  {
    id: 'account',
    keywords: ['account', 'iscriv', 'creare', 'profilo', 'compte', 'inscription', 'profil', 'sign up', 'create', 'profile', 'google'],
    question: {
      it: 'Come creo un account?',
      fr: 'Comment créer un compte ?',
      en: 'How do I create an account?',
    },
    answer: {
      it: 'Clicca su "Registrati" in alto a destra. Puoi iscriverti con email e password oppure con il tuo account Google in un solo clic. Dopo la registrazione riceverai un\'email di benvenuto e potrai accedere alla tua Dashboard personale.',
      fr: 'Cliquez sur « S\'inscrire » en haut à droite. Vous pouvez vous inscrire avec un email et un mot de passe, ou avec votre compte Google en un clic. Après l\'inscription, vous recevrez un email de bienvenue et pourrez accéder à votre tableau de bord personnel.',
      en: 'Click "Sign Up" at the top right. You can register with email and password, or with your Google account in one click. After registration you will receive a welcome email and can access your personal Dashboard.',
    },
    link: { path: '/register', label: { it: 'Registrati', fr: 'S\'inscrire', en: 'Sign up' } },
  },
  {
    id: 'password',
    keywords: ['password', 'dimenticat', 'reset', 'mot de passe', 'oublié', 'forgot', 'reimpost'],
    question: {
      it: 'Ho dimenticato la password, cosa faccio?',
      fr: 'J\'ai oublié mon mot de passe, que faire ?',
      en: 'I forgot my password, what do I do?',
    },
    answer: {
      it: 'Nella pagina di accesso clicca su "Password dimenticata?". Inserisci la tua email e riceverai un link per reimpostare la password. Il link è valido per 1 ora.',
      fr: 'Sur la page de connexion, cliquez sur « Mot de passe oublié ? ». Saisissez votre email et vous recevrez un lien pour réinitialiser votre mot de passe. Le lien est valable 1 heure.',
      en: 'On the login page, click "Forgot password?". Enter your email and you will receive a link to reset your password. The link is valid for 1 hour.',
    },
    link: { path: '/forgot-password', label: { it: 'Reimposta password', fr: 'Réinitialiser', en: 'Reset password' } },
  },
  {
    id: 'verification',
    keywords: ['verifica', 'badge', 'approvazione', 'attesa', 'pending', 'verification', 'approved', 'vérifi', 'approbation', 'attente'],
    question: {
      it: 'Quanto tempo serve per verificare la mia attività?',
      fr: 'Combien de temps pour vérifier mon activité ?',
      en: 'How long does business verification take?',
    },
    answer: {
      it: 'Dopo la registrazione, la tua attività appare come "In attesa". Il nostro team la verifica di solito entro 24-48 ore. Riceverai un\'email quando sarà approvata: da quel momento sarà visibile nella directory con il badge di verifica.',
      fr: 'Après l\'enregistrement, votre activité apparaît comme « En attente ». Notre équipe la vérifie généralement sous 24 à 48 heures. Vous recevrez un email quand elle sera approuvée : elle sera alors visible dans l\'annuaire avec le badge vérifié.',
      en: 'After registration, your business appears as "Pending". Our team usually verifies it within 24-48 hours. You will receive an email once approved: it will then be visible in the directory with the verified badge.',
    },
  },
  {
    id: 'contact',
    keywords: ['contatt', 'assistenza', 'aiuto', 'problema', 'support', 'help', 'contact', 'aide', 'problème', 'segnala'],
    question: {
      it: 'Come contatto l\'assistenza?',
      fr: 'Comment contacter le support ?',
      en: 'How do I contact support?',
    },
    answer: {
      it: 'Puoi scriverci a support@afroitalia.com per qualsiasi problema tecnico, segnalazione o suggerimento. Rispondiamo di solito entro 24 ore lavorative.',
      fr: 'Vous pouvez nous écrire à support@afroitalia.com pour tout problème technique, signalement ou suggestion. Nous répondons généralement sous 24 heures ouvrées.',
      en: 'You can write to us at support@afroitalia.com for any technical issue, report or suggestion. We usually reply within 24 business hours.',
    },
  },
];

export const BOT_UI = {
  title: { it: 'Assistente AfroItalia', fr: 'Assistant AfroItalia', en: 'AfroItalia Assistant' },
  subtitle: { it: 'Ti aiuto a usare la piattaforma', fr: 'Je vous aide à utiliser la plateforme', en: 'I help you use the platform' },
  greeting: {
    it: 'Ciao! 👋 Sono l\'assistente di AfroItalia. Scegli una domanda qui sotto oppure scrivimi cosa vuoi fare.',
    fr: 'Bonjour ! 👋 Je suis l\'assistant d\'AfroItalia. Choisissez une question ci-dessous ou écrivez-moi ce que vous voulez faire.',
    en: 'Hi! 👋 I\'m the AfroItalia assistant. Pick a question below or type what you want to do.',
  },
  placeholder: { it: 'Scrivi una domanda…', fr: 'Écrivez une question…', en: 'Type a question…' },
  fallback: {
    it: 'Non ho capito bene la domanda. 🤔 Prova a riformularla o scegli una delle domande frequenti qui sotto.',
    fr: 'Je n\'ai pas bien compris la question. 🤔 Essayez de la reformuler ou choisissez une des questions fréquentes ci-dessous.',
    en: 'I didn\'t quite understand. 🤔 Try rephrasing, or pick one of the frequent questions below.',
  },
  suggestionsLabel: { it: 'Domande frequenti', fr: 'Questions fréquentes', en: 'Frequent questions' },
  open: { it: 'Apri assistente', fr: 'Ouvrir l\'assistant', en: 'Open assistant' },
  close: { it: 'Chiudi', fr: 'Fermer', en: 'Close' },
  send: { it: 'Invia', fr: 'Envoyer', en: 'Send' },
};

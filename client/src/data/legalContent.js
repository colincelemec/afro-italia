// ============================================
// Contenuti legali — testo modello multilingua (it / fr / en)
// Privacy Policy · Terms of Service · Cookie Policy · GDPR
//
// NOTA: si tratta di testo modello generico. Prima della pubblicazione
// definitiva, far revisionare i contenuti da un consulente legale e
// sostituire i dati segnaposto (ragione sociale, indirizzo, P.IVA, ecc.).
// ============================================

// Valori segnaposto riutilizzati nei testi
export const LEGAL_COMPANY = {
  name: 'AfroItalia',
  email: 'privacy@afroitalia.com',
  updated: { en: 'Last updated: June 2026', fr: 'Dernière mise à jour : juin 2026', it: 'Ultimo aggiornamento: giugno 2026' },
};

// Ordine dei documenti + chiavi
export const LEGAL_TYPES = ['privacy', 'terms', 'cookies', 'gdpr'];

export const LEGAL_DOCS = {
  // ════════════════════════════════════════
  // PRIVACY POLICY
  // ════════════════════════════════════════
  privacy: {
    icon: 'shield',
    title: { en: 'Privacy Policy', fr: 'Politique de Confidentialité', it: 'Informativa sulla Privacy' },
    intro: {
      en: 'AfroItalia ("we", "us") respects your privacy. This Privacy Policy explains what personal data we collect, how we use it, and the rights you have over it when you use our platform.',
      fr: 'AfroItalia (« nous ») respecte votre vie privée. La présente politique explique quelles données personnelles nous collectons, comment nous les utilisons et les droits dont vous disposez lorsque vous utilisez notre plateforme.',
      it: 'AfroItalia (« noi ») rispetta la tua privacy. La presente informativa spiega quali dati personali raccogliamo, come li utilizziamo e quali diritti hai quando utilizzi la nostra piattaforma.',
    },
    sections: [
      {
        heading: { en: '1. Data we collect', fr: '1. Données que nous collectons', it: '1. Dati che raccogliamo' },
        body: {
          en: 'We collect information you provide directly: your name, email address, password (stored encrypted), and phone number when you register. If you publish a business or service, we also collect the details you enter, such as name, description, address, contact details and images.\n\nWe automatically collect limited technical data such as your IP address, browser type and pages visited, in order to keep the service secure and to improve it.',
          fr: 'Nous collectons les informations que vous fournissez directement : nom, adresse e-mail, mot de passe (stocké chiffré) et numéro de téléphone lors de votre inscription. Si vous publiez une activité ou un service, nous collectons également les informations saisies : nom, description, adresse, coordonnées et images.\n\nNous collectons automatiquement des données techniques limitées telles que votre adresse IP, le type de navigateur et les pages consultées, afin de sécuriser et d’améliorer le service.',
          it: 'Raccogliamo le informazioni che fornisci direttamente: nome, indirizzo e-mail, password (memorizzata in forma cifrata) e numero di telefono al momento della registrazione. Se pubblichi un’attività o un servizio, raccogliamo anche i dati inseriti: nome, descrizione, indirizzo, recapiti e immagini.\n\nRaccogliamo automaticamente dati tecnici limitati come indirizzo IP, tipo di browser e pagine visitate, per mantenere sicuro e migliorare il servizio.',
        },
      },
      {
        heading: { en: '2. How we use your data', fr: '2. Utilisation de vos données', it: '2. Come utilizziamo i tuoi dati' },
        body: {
          en: 'We use your data to create and manage your account, to publish and display the businesses and reviews you submit, to provide customer support, to ensure security, and to comply with legal obligations. We do not sell your personal data to third parties.',
          fr: 'Nous utilisons vos données pour créer et gérer votre compte, publier et afficher les activités et avis que vous soumettez, fournir une assistance, assurer la sécurité et respecter nos obligations légales. Nous ne vendons pas vos données personnelles à des tiers.',
          it: 'Utilizziamo i tuoi dati per creare e gestire il tuo account, pubblicare e mostrare le attività e le recensioni che invii, fornire assistenza, garantire la sicurezza e adempiere agli obblighi di legge. Non vendiamo i tuoi dati personali a terzi.',
        },
      },
      {
        heading: { en: '3. Legal basis', fr: '3. Base légale', it: '3. Base giuridica' },
        body: {
          en: 'We process your data on the basis of the performance of our contract with you (providing the service), your consent (where requested), our legitimate interest in operating and securing the platform, and compliance with legal obligations.',
          fr: 'Nous traitons vos données sur la base de l’exécution de notre contrat (fourniture du service), de votre consentement (lorsqu’il est demandé), de notre intérêt légitime à exploiter et sécuriser la plateforme, et du respect de nos obligations légales.',
          it: 'Trattiamo i tuoi dati sulla base dell’esecuzione del contratto (fornitura del servizio), del tuo consenso (ove richiesto), del nostro legittimo interesse a gestire e mettere in sicurezza la piattaforma e dell’adempimento degli obblighi di legge.',
        },
      },
      {
        heading: { en: '4. Data retention', fr: '4. Conservation des données', it: '4. Conservazione dei dati' },
        body: {
          en: 'We keep your personal data for as long as your account is active. If you delete your account, we remove your personal data within a reasonable period, except where we are required to retain certain information to comply with the law.',
          fr: 'Nous conservons vos données personnelles tant que votre compte est actif. Si vous supprimez votre compte, nous effaçons vos données dans un délai raisonnable, sauf obligation légale de conservation.',
          it: 'Conserviamo i tuoi dati personali finché il tuo account è attivo. Se elimini l’account, rimuoviamo i tuoi dati entro un periodo ragionevole, salvo gli obblighi di legge che impongano di conservarne alcuni.',
        },
      },
      {
        heading: { en: '5. Sharing with third parties', fr: '5. Partage avec des tiers', it: '5. Condivisione con terzi' },
        body: {
          en: 'We may share data with trusted service providers who help us operate the platform (such as hosting and payment processing), strictly for those purposes and under appropriate confidentiality agreements. We may also disclose data when required by a competent authority.',
          fr: 'Nous pouvons partager des données avec des prestataires de confiance qui nous aident à exploiter la plateforme (hébergement, traitement des paiements), strictement à ces fins et sous accords de confidentialité appropriés. Nous pouvons également divulguer des données à la demande d’une autorité compétente.',
          it: 'Possiamo condividere dati con fornitori di fiducia che ci aiutano a gestire la piattaforma (hosting, gestione dei pagamenti), esclusivamente per tali finalità e nel rispetto di adeguati accordi di riservatezza. Possiamo inoltre comunicare dati su richiesta di un’autorità competente.',
        },
      },
      {
        heading: { en: '6. Your rights', fr: '6. Vos droits', it: '6. I tuoi diritti' },
        body: {
          en: 'You may access, correct, export or delete your personal data, and object to or restrict certain processing. To exercise these rights, contact us at the address below. You also have the right to lodge a complaint with a data protection authority.',
          fr: 'Vous pouvez accéder à vos données, les corriger, les exporter ou les supprimer, et vous opposer à certains traitements ou en demander la limitation. Pour exercer ces droits, contactez-nous à l’adresse ci-dessous. Vous avez également le droit d’introduire une réclamation auprès d’une autorité de protection des données.',
          it: 'Puoi accedere ai tuoi dati, correggerli, esportarli o eliminarli, nonché opporti a determinati trattamenti o chiederne la limitazione. Per esercitare questi diritti, contattaci all’indirizzo indicato sotto. Hai inoltre il diritto di proporre reclamo a un’autorità di controllo.',
        },
      },
      {
        heading: { en: '7. Contact', fr: '7. Contact', it: '7. Contatti' },
        body: {
          en: 'For any privacy-related question or request, contact us at privacy@afroitalia.com.',
          fr: 'Pour toute question ou demande relative à la confidentialité, écrivez-nous à privacy@afroitalia.com.',
          it: 'Per qualsiasi domanda o richiesta in materia di privacy, scrivici a privacy@afroitalia.com.',
        },
      },
    ],
  },

  // ════════════════════════════════════════
  // TERMS OF SERVICE
  // ════════════════════════════════════════
  terms: {
    icon: 'check',
    title: { en: 'Terms of Service', fr: 'Conditions d’Utilisation', it: 'Termini di Servizio' },
    intro: {
      en: 'These Terms of Service govern your access to and use of the AfroItalia platform. By creating an account or using the service, you agree to these terms.',
      fr: 'Les présentes conditions régissent votre accès et votre utilisation de la plateforme AfroItalia. En créant un compte ou en utilisant le service, vous acceptez ces conditions.',
      it: 'I presenti Termini disciplinano l’accesso e l’uso della piattaforma AfroItalia. Creando un account o utilizzando il servizio, accetti questi termini.',
    },
    sections: [
      {
        heading: { en: '1. Use of the service', fr: '1. Utilisation du service', it: '1. Uso del servizio' },
        body: {
          en: 'AfroItalia is a directory that helps users discover businesses and services of the African diaspora in Italy. You must be at least 18 years old, or have the consent of a legal guardian, to create an account. You are responsible for keeping your login details secure.',
          fr: 'AfroItalia est un annuaire qui aide les utilisateurs à découvrir les activités et services de la diaspora africaine en Italie. Vous devez avoir au moins 18 ans, ou disposer du consentement d’un représentant légal, pour créer un compte. Vous êtes responsable de la confidentialité de vos identifiants.',
          it: 'AfroItalia è una directory che aiuta gli utenti a scoprire le attività e i servizi della diaspora africana in Italia. Per creare un account devi avere almeno 18 anni o il consenso di un tutore legale. Sei responsabile della custodia delle tue credenziali di accesso.',
        },
      },
      {
        heading: { en: '2. User content', fr: '2. Contenus des utilisateurs', it: '2. Contenuti degli utenti' },
        body: {
          en: 'When you publish a business, service or review, you confirm that the information is accurate and that you have the right to share it. You retain ownership of your content but grant AfroItalia a licence to display it on the platform. You must not publish content that is illegal, misleading, offensive or that infringes the rights of others.',
          fr: 'Lorsque vous publiez une activité, un service ou un avis, vous confirmez que les informations sont exactes et que vous avez le droit de les partager. Vous conservez la propriété de vos contenus mais accordez à AfroItalia une licence pour les afficher sur la plateforme. Vous ne devez pas publier de contenus illégaux, trompeurs, offensants ou portant atteinte aux droits d’autrui.',
          it: 'Quando pubblichi un’attività, un servizio o una recensione, confermi che le informazioni sono accurate e di avere il diritto di condividerle. Mantieni la proprietà dei tuoi contenuti ma concedi ad AfroItalia una licenza per mostrarli sulla piattaforma. Non puoi pubblicare contenuti illegali, ingannevoli, offensivi o lesivi dei diritti altrui.',
        },
      },
      {
        heading: { en: '3. Moderation', fr: '3. Modération', it: '3. Moderazione' },
        body: {
          en: 'Submitted businesses and services are reviewed before they are published. We may verify, reject, suspend or remove any listing or review that does not comply with these terms, without prior notice where necessary to protect users.',
          fr: 'Les activités et services soumis sont examinés avant publication. Nous pouvons vérifier, rejeter, suspendre ou supprimer toute fiche ou tout avis non conforme aux présentes conditions, sans préavis lorsque cela est nécessaire pour protéger les utilisateurs.',
          it: 'Le attività e i servizi inviati vengono esaminati prima della pubblicazione. Possiamo verificare, rifiutare, sospendere o rimuovere qualsiasi inserzione o recensione non conforme ai presenti termini, anche senza preavviso quando necessario per tutelare gli utenti.',
        },
      },
      {
        heading: { en: '4. Subscriptions and payments', fr: '4. Abonnements et paiements', it: '4. Abbonamenti e pagamenti' },
        body: {
          en: 'Some features may require a paid subscription. Prices and features are shown before purchase. Payments are processed by a third-party provider. Unless otherwise stated, subscriptions renew automatically until cancelled.',
          fr: 'Certaines fonctionnalités peuvent nécessiter un abonnement payant. Les prix et fonctionnalités sont indiqués avant l’achat. Les paiements sont traités par un prestataire tiers. Sauf indication contraire, les abonnements se renouvellent automatiquement jusqu’à leur résiliation.',
          it: 'Alcune funzionalità possono richiedere un abbonamento a pagamento. Prezzi e funzionalità sono indicati prima dell’acquisto. I pagamenti sono gestiti da un fornitore terzo. Salvo diversa indicazione, gli abbonamenti si rinnovano automaticamente fino alla disdetta.',
        },
      },
      {
        heading: { en: '5. Limitation of liability', fr: '5. Limitation de responsabilité', it: '5. Limitazione di responsabilità' },
        body: {
          en: 'The platform is provided "as is". AfroItalia does not guarantee the accuracy of listings published by users and is not a party to any transaction between users and businesses. To the extent permitted by law, we are not liable for indirect or consequential damages arising from use of the service.',
          fr: 'La plateforme est fournie « en l’état ». AfroItalia ne garantit pas l’exactitude des fiches publiées par les utilisateurs et n’est pas partie aux transactions entre utilisateurs et entreprises. Dans la mesure permise par la loi, nous ne sommes pas responsables des dommages indirects résultant de l’utilisation du service.',
          it: 'La piattaforma è fornita « così com’è ». AfroItalia non garantisce l’esattezza delle inserzioni pubblicate dagli utenti e non è parte delle transazioni tra utenti e attività. Nei limiti consentiti dalla legge, non siamo responsabili per danni indiretti o consequenziali derivanti dall’uso del servizio.',
        },
      },
      {
        heading: { en: '6. Termination', fr: '6. Résiliation', it: '6. Risoluzione' },
        body: {
          en: 'You may close your account at any time. We may suspend or terminate access if you breach these terms. Provisions that by their nature should survive termination will continue to apply.',
          fr: 'Vous pouvez fermer votre compte à tout moment. Nous pouvons suspendre ou résilier l’accès en cas de violation des présentes conditions. Les dispositions qui, par leur nature, doivent survivre à la résiliation continueront de s’appliquer.',
          it: 'Puoi chiudere il tuo account in qualsiasi momento. Possiamo sospendere o revocare l’accesso in caso di violazione dei presenti termini. Le disposizioni che per loro natura devono sopravvivere alla risoluzione continueranno ad applicarsi.',
        },
      },
      {
        heading: { en: '7. Governing law', fr: '7. Droit applicable', it: '7. Legge applicabile' },
        body: {
          en: 'These terms are governed by Italian law. Any dispute will be subject to the competent courts, without prejudice to any mandatory consumer protection rules that may apply to you.',
          fr: 'Les présentes conditions sont régies par le droit italien. Tout litige relèvera des tribunaux compétents, sans préjudice des règles impératives de protection des consommateurs qui pourraient s’appliquer.',
          it: 'I presenti termini sono regolati dalla legge italiana. Ogni controversia sarà devoluta al foro competente, fatte salve le norme imperative a tutela dei consumatori eventualmente applicabili.',
        },
      },
    ],
  },

  // ════════════════════════════════════════
  // COOKIE POLICY
  // ════════════════════════════════════════
  cookies: {
    icon: 'globe',
    title: { en: 'Cookie Policy', fr: 'Politique des Cookies', it: 'Informativa sui Cookie' },
    intro: {
      en: 'This Cookie Policy explains how AfroItalia uses cookies and similar technologies when you visit our platform.',
      fr: 'La présente politique explique comment AfroItalia utilise les cookies et technologies similaires lorsque vous visitez notre plateforme.',
      it: 'La presente informativa spiega come AfroItalia utilizza i cookie e tecnologie simili quando visiti la nostra piattaforma.',
    },
    sections: [
      {
        heading: { en: '1. What cookies are', fr: '1. Qu’est-ce qu’un cookie', it: '1. Cosa sono i cookie' },
        body: {
          en: 'Cookies are small text files stored on your device when you visit a website. They allow the site to remember your actions and preferences over time, such as your login session or chosen language.',
          fr: 'Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez un site. Ils permettent au site de mémoriser vos actions et préférences, comme votre session de connexion ou la langue choisie.',
          it: 'I cookie sono piccoli file di testo memorizzati sul tuo dispositivo quando visiti un sito. Consentono al sito di ricordare le tue azioni e preferenze, come la sessione di accesso o la lingua scelta.',
        },
      },
      {
        heading: { en: '2. Cookies we use', fr: '2. Cookies que nous utilisons', it: '2. Cookie che utilizziamo' },
        body: {
          en: 'Essential cookies are necessary for the platform to work, for example to keep you logged in and to remember your language preference. We may also use analytics cookies to understand how the platform is used, so we can improve it. Analytics cookies are only set with your consent where required.',
          fr: 'Les cookies essentiels sont nécessaires au fonctionnement de la plateforme, par exemple pour vous garder connecté et mémoriser votre langue. Nous pouvons également utiliser des cookies de mesure d’audience pour comprendre l’utilisation de la plateforme et l’améliorer. Ces cookies ne sont déposés qu’avec votre consentement lorsque cela est requis.',
          it: 'I cookie essenziali sono necessari al funzionamento della piattaforma, ad esempio per mantenerti connesso e ricordare la lingua. Possiamo inoltre utilizzare cookie analitici per capire come viene usata la piattaforma e migliorarla. I cookie analitici vengono impostati solo con il tuo consenso, ove richiesto.',
        },
      },
      {
        heading: { en: '3. Managing cookies', fr: '3. Gérer les cookies', it: '3. Gestione dei cookie' },
        body: {
          en: 'You can control and delete cookies through your browser settings. Please note that disabling essential cookies may affect how the platform works, for example by preventing you from staying logged in.',
          fr: 'Vous pouvez contrôler et supprimer les cookies via les paramètres de votre navigateur. Notez que la désactivation des cookies essentiels peut affecter le fonctionnement de la plateforme, par exemple en vous empêchant de rester connecté.',
          it: 'Puoi controllare ed eliminare i cookie tramite le impostazioni del browser. La disabilitazione dei cookie essenziali può compromettere il funzionamento della piattaforma, ad esempio impedendoti di restare connesso.',
        },
      },
      {
        heading: { en: '4. Third-party cookies', fr: '4. Cookies tiers', it: '4. Cookie di terze parti' },
        body: {
          en: 'Some features, such as maps or social media links, may set cookies from third parties. These are governed by the privacy policies of those providers.',
          fr: 'Certaines fonctionnalités, comme les cartes ou les liens vers les réseaux sociaux, peuvent déposer des cookies de tiers. Ceux-ci sont régis par les politiques de confidentialité de ces fournisseurs.',
          it: 'Alcune funzionalità, come le mappe o i link ai social media, possono impostare cookie di terze parti. Questi sono regolati dalle informative sulla privacy di tali fornitori.',
        },
      },
    ],
  },

  // ════════════════════════════════════════
  // GDPR
  // ════════════════════════════════════════
  gdpr: {
    icon: 'shield',
    title: { en: 'GDPR Compliance', fr: 'Conformité RGPD', it: 'Conformità al GDPR' },
    intro: {
      en: 'AfroItalia is committed to protecting personal data in accordance with the EU General Data Protection Regulation (GDPR). This page summarises your rights and how we uphold them.',
      fr: 'AfroItalia s’engage à protéger les données personnelles conformément au Règlement Général sur la Protection des Données (RGPD). Cette page résume vos droits et la manière dont nous les respectons.',
      it: 'AfroItalia si impegna a proteggere i dati personali nel rispetto del Regolamento Generale sulla Protezione dei Dati (GDPR). Questa pagina riassume i tuoi diritti e come li garantiamo.',
    },
    sections: [
      {
        heading: { en: '1. Your rights under the GDPR', fr: '1. Vos droits au titre du RGPD', it: '1. I tuoi diritti ai sensi del GDPR' },
        body: {
          en: 'You have the right to be informed about how your data is used, to access your data, to have inaccurate data corrected, to have your data erased, to restrict or object to processing, and to data portability. You can also withdraw consent at any time where processing is based on consent.',
          fr: 'Vous avez le droit d’être informé de l’utilisation de vos données, d’y accéder, de faire rectifier les données inexactes, de les faire effacer, de limiter ou de vous opposer au traitement, et à la portabilité des données. Vous pouvez également retirer votre consentement à tout moment lorsque le traitement repose sur celui-ci.',
          it: 'Hai il diritto di essere informato sull’uso dei tuoi dati, di accedervi, di far rettificare i dati inesatti, di farli cancellare, di limitare od opporti al trattamento e alla portabilità dei dati. Puoi inoltre revocare il consenso in qualsiasi momento quando il trattamento si basa su di esso.',
        },
      },
      {
        heading: { en: '2. How to exercise your rights', fr: '2. Comment exercer vos droits', it: '2. Come esercitare i tuoi diritti' },
        body: {
          en: 'You can exercise most rights directly from your account: update your profile, edit or delete your listings, or close your account. For any other request, contact us at privacy@afroitalia.com and we will respond within the time limits set by the GDPR (generally one month).',
          fr: 'Vous pouvez exercer la plupart de vos droits directement depuis votre compte : mettre à jour votre profil, modifier ou supprimer vos fiches, ou fermer votre compte. Pour toute autre demande, contactez-nous à privacy@afroitalia.com ; nous répondrons dans les délais prévus par le RGPD (en général un mois).',
          it: 'Puoi esercitare la maggior parte dei diritti direttamente dal tuo account: aggiornare il profilo, modificare o eliminare le tue inserzioni o chiudere l’account. Per ogni altra richiesta, scrivici a privacy@afroitalia.com e risponderemo entro i termini previsti dal GDPR (di norma un mese).',
        },
      },
      {
        heading: { en: '3. Data security', fr: '3. Sécurité des données', it: '3. Sicurezza dei dati' },
        body: {
          en: 'We apply appropriate technical and organisational measures to protect your data, including encryption of passwords, restricted access and secure hosting. No system is completely secure, but we work continuously to safeguard your information.',
          fr: 'Nous appliquons des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des mots de passe, accès restreint et hébergement sécurisé. Aucun système n’est totalement sûr, mais nous œuvrons en permanence à la protection de vos informations.',
          it: 'Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati: cifratura delle password, accesso limitato e hosting sicuro. Nessun sistema è del tutto sicuro, ma lavoriamo costantemente per tutelare le tue informazioni.',
        },
      },
      {
        heading: { en: '4. International transfers', fr: '4. Transferts internationaux', it: '4. Trasferimenti internazionali' },
        body: {
          en: 'Where data is transferred outside the European Economic Area, we ensure appropriate safeguards are in place, such as standard contractual clauses approved by the European Commission.',
          fr: 'Lorsque des données sont transférées hors de l’Espace économique européen, nous veillons à la mise en place de garanties appropriées, telles que les clauses contractuelles types approuvées par la Commission européenne.',
          it: 'Quando i dati vengono trasferiti al di fuori dello Spazio Economico Europeo, garantiamo l’adozione di adeguate garanzie, come le clausole contrattuali standard approvate dalla Commissione Europea.',
        },
      },
      {
        heading: { en: '5. Complaints', fr: '5. Réclamations', it: '5. Reclami' },
        body: {
          en: 'If you believe your data protection rights have been infringed, you have the right to lodge a complaint with your national supervisory authority. In Italy, this is the Garante per la protezione dei dati personali.',
          fr: 'Si vous estimez que vos droits en matière de protection des données ont été enfreints, vous pouvez introduire une réclamation auprès de votre autorité de contrôle nationale. En Italie, il s’agit du Garante per la protezione dei dati personali.',
          it: 'Se ritieni che i tuoi diritti in materia di protezione dei dati siano stati violati, hai il diritto di proporre reclamo all’autorità di controllo nazionale. In Italia è il Garante per la protezione dei dati personali.',
        },
      },
    ],
  },
};

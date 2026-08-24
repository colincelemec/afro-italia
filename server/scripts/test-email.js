#!/usr/bin/env node
/* ============================================
   test-email — vérifie la configuration SMTP
   et envoie un vrai email de bienvenue.

   Usage :
     npm run email:test                     → diagnostic seul
     npm run email:test -- vous@email.com   → envoie un email de test
   ============================================ */

require('dotenv').config();
const emailService = require('../src/services/emailService');

const MASK = (v) => (v ? v.slice(0, 3) + '•'.repeat(Math.max(0, v.length - 3)) : '(vide)');

async function main() {
  const recipient = process.argv[2];

  console.log('\n══════ Diagnostic email AfroItalia ══════\n');

  // 1. Ce que voit le serveur
  console.log('Variables détectées :');
  console.log('  SMTP_HOST  :', process.env.SMTP_HOST || '(vide)');
  console.log('  SMTP_PORT  :', process.env.SMTP_PORT || '(vide, 587 par défaut)');
  console.log('  SMTP_USER  :', process.env.SMTP_USER || '(vide)');
  console.log('  SMTP_PASS  :', MASK(process.env.SMTP_PASS));
  console.log('  EMAIL_FROM :', process.env.EMAIL_FROM || '(défaut)');
  console.log('');

  // 2. Le service se considère-t-il configuré ?
  if (!emailService.isConfigured) {
    console.log('❌ SMTP non configuré — les emails seront affichés dans la console,');
    console.log('   pas envoyés.\n');
    console.log('Pour les envoyer réellement, renseignez dans server/.env :\n');
    console.log('   SMTP_HOST=smtp-relay.brevo.com');
    console.log('   SMTP_PORT=587');
    console.log('   SMTP_USER=<votre identifiant Brevo>');
    console.log('   SMTP_PASS=<votre clé SMTP Brevo>');
    console.log('   EMAIL_FROM=AfroItalia <no-reply@votredomaine.com>\n');
    console.log('Créez un compte gratuit sur brevo.com → menu « SMTP & API ».');
    console.log('(300 emails/jour gratuits, sans carte bancaire.)\n');
    process.exit(1);
  }

  console.log('✅ Configuration détectée comme valide\n');

  // 3. Le serveur SMTP répond-il ?
  process.stdout.write('Connexion au serveur SMTP… ');
  const check = await emailService.verifyConnection();
  if (!check.ok) {
    console.log('❌\n');
    console.log('   Cause :', check.reason, '\n');
    console.log('Pistes fréquentes :');
    console.log('  • Identifiants incorrects');
    console.log('  • Avec Gmail : il faut un « mot de passe d\'application »,');
    console.log('    pas le mot de passe du compte (et la validation en 2 étapes activée)');
    console.log('  • Port bloqué par le réseau (essayez 587, ou 465 avec SMTP_SECURE=true)\n');
    process.exit(1);
  }
  console.log('✅\n');

  // 4. Envoi réel
  if (!recipient) {
    console.log('Tout est prêt. Pour envoyer un email de test :\n');
    console.log('   npm run email:test -- vous@email.com\n');
    return;
  }

  console.log(`Envoi d'un email de bienvenue à ${recipient}…\n`);
  await emailService.sendWelcomeEmail(
    { email: recipient, firstName: 'Test' },
    process.env.TEST_LANG || 'fr'
  );
  console.log('\n✅ Email envoyé. Vérifiez votre boîte de réception');
  console.log('   (et le dossier spam la première fois).\n');
}

main().catch((error) => {
  console.error('\n❌ Échec :', error.message, '\n');
  process.exit(1);
});

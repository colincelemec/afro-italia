#!/usr/bin/env node
/* ============================================
   publish-pending — publie les fiches en attente

   Les activités créées AVANT le passage à la publication
   immédiate portent encore le statut PENDING : elles restent
   invisibles dans l'annuaire. Ce script les publie en une fois.

   Elles n'obtiennent PAS le badge « vérifié » : à toi de le
   donner depuis le panneau d'administration après contrôle.

   Usage :
     node scripts/publish-pending.js          → aperçu (rien n'est modifié)
     node scripts/publish-pending.js --apply  → applique les changements
   ============================================ */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const APPLY = process.argv.includes('--apply');

async function main() {
  const pending = await prisma.business.findMany({
    where: { status: 'PENDING' },
    select: {
      id: true,
      name: true,
      createdAt: true,
      city: { select: { name: true } },
      owner: { select: { email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (pending.length === 0) {
    console.log('\n✅ Aucune activité en attente : tout est déjà publié.\n');
    return;
  }

  console.log(`\n${pending.length} activité(s) en attente de publication :\n`);
  pending.forEach((b) => {
    const date = b.createdAt.toISOString().split('T')[0];
    console.log(`   • ${b.name}${b.city?.name ? ` — ${b.city.name}` : ''}  (${date})`);
    console.log(`     propriétaire : ${b.owner?.email || '—'}`);
  });

  if (!APPLY) {
    console.log('\nAperçu uniquement — rien n\'a été modifié.');
    console.log('Pour publier ces activités :\n');
    console.log('   node scripts/publish-pending.js --apply\n');
    return;
  }

  const result = await prisma.business.updateMany({
    where: { status: 'PENDING' },
    data: { status: 'VERIFIED' }, // publiées, mais isVerified reste false
  });

  console.log(`\n✅ ${result.count} activité(s) publiée(s).`);
  console.log('   Elles sont maintenant visibles de tous, y compris des');
  console.log('   visiteurs sans compte, et apparaissent dans le sitemap.');
  console.log('   Le badge « vérifié » s\'attribue depuis le panneau admin.\n');
}

main()
  .catch((e) => {
    if (e.errorCode === 'P1001' || /Can't reach database server/i.test(e.message || '')) {
      console.error('\n❌ Base de données inaccessible.');
      console.error('   Démarrez-la : docker compose up -d postgres\n');
      process.exit(1);
    }
    console.error('\n❌ Erreur :', e.message, '\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const drafts = await prisma.wedding.findMany({
    where: { status: 'DRAFT' },
    select: { id: true, title: true, slug: true, isDemo: true, date: true, hostCouple: { select: { user: { select: { email: true, name: true } } } } }
  });
  console.log('DRAFT WEDDINGS:', drafts.length);
  drafts.forEach(d => {
    console.log(`- [${d.id}] "${d.title}" (${d.slug}) host=${d.hostCouple?.user?.name} (${d.hostCouple?.user?.email})`);
  });
}

main().finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orgs = await Promise.all([
    prisma.organization.create({
      data: {
        name: 'TechSavvy Innovations',
        slug: 'techsavvy-innovations',
      },
    }),
    prisma.organization.create({
      data: {
        name: 'iHub Networks',
        slug: 'ihub-networks',
      },
    }),
    prisma.organization.create({
      data: {
        name: 'Silicon Savannah Innovations',
        slug: 'silicon-savannah-innovations',
      },
    }),
  ]);

  await Promise.all([
    // Users for TechSavvy Innovations
    prisma.user.create({
      data: {
        name: 'James Kabogo',
        email: 'kabogp@gmail.com',
        password: '@kabz123',
        role: 'ADMIN',
        organizationId: orgs[0].id,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Wanjiru Njoroge',
        email: 'wanjiru@gmail.com',
        password: 'password123',
        role: 'STAFF',
        organizationId: orgs[0].id,
      },
    }),

    // Users for iHub Networks
    prisma.user.create({
      data: {
        name: 'Akinyi Otieno',
        email: 'akinyi@gmail.com',
        password: 'password123',
        role: 'MANAGER',
        organizationId: orgs[1].id,
      },
    }),

    // Users for Silicon Savannah Innovations
    prisma.user.create({
      data: {
        name: 'Cherono Kamau',
        email: 'cherono@siliconsavannah.co.ke',
        password: 'password123',
        role: 'ADMIN',
        organizationId: orgs[2].id,
      },
    }),
  ]);

  await Promise.all([
    // Clients for TechSavvy Innovations
    prisma.client.createMany({
      data: [
        { name: 'Nduku Mwangi', email: 'nduku@techsavvy.co.ke', organizationId: orgs[0].id },
        { name: 'Mutiso Kibwana', email: 'mutiso@techsavvy.co.ke', organizationId: orgs[0].id },
      ],
    }),

    // Clients for iHub Networks
    prisma.client.createMany({
      data: [
        { name: 'Akoth Wambua', email: 'akoth@ihub.co.ke', organizationId: orgs[1].id },
      ],
    }),

    // Clients for Silicon Savannah Innovations
    prisma.client.createMany({
      data: [
        { name: 'Nyambura Njeri', email: 'nyambura@siliconsavannah.co.ke', organizationId: orgs[2].id },
        { name: 'Auma Odinga', email: 'auma@siliconsavannah.co.ke', organizationId: orgs[2].id },
      ],
    }),
  ]);
}

main()
  .then(() => {
    console.log('✅ Seed data created!');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });

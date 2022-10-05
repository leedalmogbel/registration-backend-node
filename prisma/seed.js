const { PrismaClient } = require('@prisma/client');
const { roles, permissions, users, seasons, stables } = require('./data.js');
const prisma = new PrismaClient();

const load = async () => {
  try {
    await prisma.roles.createMany({
      data: roles,
    });
    await prisma.permissions.createMany({
      data: permissions,
    });
    console.log('Roles and Permission are created');
    await prisma.users.createMany({
      data: users,
    });
    console.log('Users are created');

    await prisma.seasons.createMany({
      data: seasons,
    });
    console.log('Seasons are created');

    await prisma.stables.createMany({
      data: stables,
    });
    console.log('Stables are created');
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};

load();

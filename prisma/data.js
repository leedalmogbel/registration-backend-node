const { Prisma } = require('@prisma/client');

const roles = [
  {
    name: 'Admin',
    active: true,
  },
  {
    name: 'User',
    active: true,
  },
];

const permissions = [
  {
    id: 1,
    actions: {
      users: ['create', 'update', 'view', 'delete'],
      owners: ['create', 'update', 'view', 'delete'],
      horses: ['create', 'update', 'view', 'delete'],
      trainers: ['create', 'update', 'view', 'delete'],
      riders: ['create', 'update', 'view', 'delete'],
    },
    roleId: 1,
  },
  {
    id: 2,
    actions: {
      owners: ['create', 'update', 'view', 'delete'],
      horses: ['create', 'update', 'view', 'delete'],
      trainers: ['create', 'update', 'view', 'delete'],
      riders: ['create', 'update', 'view', 'delete'],
    },
    roleId: 2,
  },
];

const users = [
  {
    firstName: 'super',
    lastName: 'admin',
    username: 'superadmin',
    email: 'info@eiev.com',
    password: '$2a$08$wz7kiyoGLJkvQynehhT/vODPBn0N4x7rfrUVg94df6r0wM5Yxo3pa',
    emiratesId: 'emi123123',
    dob: '2022-02-02T00:00:00.000Z',
    mobile: '123456789',
    documents: {
      documentExpiry: '2022-02-02',
    },
    status: 'approved',
    active: true,
    userType: 'Admin',
    roleId: 1,
  },
  {
    firstName: 'fname1',
    lastName: 'lname1',
    username: 'user1',
    email: 'info1@eiev.com',
    password: '$2a$08$wz7kiyoGLJkvQynehhT/vODPBn0N4x7rfrUVg94df6r0wM5Yxo3pa',
    emiratesId: 'emi123123',
    dob: '2022-02-02T00:00:00.000Z',
    mobile: '971589525878',
    documents: {
      documentExpiry: '2022-02-02',
    },
    status: 'approved',
    active: true,
    userType: 'User',
    roleId: 2,
  },
  {
    firstName: 'fname2',
    lastName: 'lname2',
    username: 'user2',
    email: 'info2@eiev.com',
    password: '$2a$08$wz7kiyoGLJkvQynehhT/vODPBn0N4x7rfrUVg94df6r0wM5Yxo3pa',
    emiratesId: 'emi123123',
    dob: '2022-02-02T00:00:00.000Z',
    mobile: '971589525878',
    documents: {
      documentExpiry: '2022-02-02',
    },
    status: 'pending',
    active: true,
    userType: 'User',
    roleId: 2,
  },
  {
    firstName: 'fname3',
    lastName: 'lname3',
    username: 'user3',
    email: 'info3@eiev.com',
    password: '$2a$08$wz7kiyoGLJkvQynehhT/vODPBn0N4x7rfrUVg94df6r0wM5Yxo3pa',
    emiratesId: 'emi123123',
    dob: '2022-02-02T00:00:00.000Z',
    mobile: '971589525878',
    documents: {
      documentExpiry: '2022-02-02',
    },
    status: 'pending',
    active: true,
    userType: 'User',
    roleId: 2,
  },
  {
    firstName: 'fname4',
    lastName: 'lname4',
    username: 'user4',
    email: 'info4@eiev.com',
    password: '$2a$08$wz7kiyoGLJkvQynehhT/vODPBn0N4x7rfrUVg94df6r0wM5Yxo3pa',
    emiratesId: 'emi123123',
    dob: '2022-02-02T00:00:00.000Z',
    mobile: '971589525878',
    documents: {
      documentExpiry: '2022-02-02',
    },
    status: 'pending',
    active: true,
    userType: 'User',
    roleId: 2,
  },
];

module.exports = { roles, permissions, users };

const prisma = require("../utils/prisma");
require("dotenv").config();
const Permission = require('./permission.services')

const createError = require("http-errors");

class rolesService {
  static async create(data) {
    const { actions, name, active } = data;
    data = {
      name, active
    }
    const role = await prisma.roles.create({
      data
    });

    const { id } = role;

    const perm = await Permission.create({
      id,
      actions
    })

    return role;
  }

  static async fetchAll() {
    const allRoles = await prisma.roles.findMany({
      include: {
        permissions: true
      }
    });

    return allRoles;
  }

  // static async getOwner(data) {
  //   const id = parseInt(data.id);
  //   const owner = await prisma.owners.findFirst({
  //     where: {
  //       id,
  //     },
  //   });

  //   if (!owner) {
  //     throw createError.NotFound("Owner not found.");
  //   }

  //   return {
  //     id: owner.id,
  //     emiratesId: owner.emirates_id,
  //     discipline: owner.discipline,
  //     feiRegistration: {
  //       no: owner.fei_registration_no,
  //       date: owner.fei_registration_date,
  //     },
  //     visa: owner.visa,
  //     gender: owner.gender,
  //     firstname: owner.firstname,
  //     lastname: owner.lastname,
  //     dob: owner.dob,
  //     nationality: owner.nationality,
  //     address: {
  //       uae: {
  //         address: owner.uae_address,
  //         city: owner.uae_city,
  //         country: owner.uae_country,
  //       },
  //       home: {
  //         address: owner.home_address,
  //         city: owner.home_city,
  //         country: owner.home_country,
  //       },
  //     },
  //     poBox: owner.pobox,
  //     email: owner.contact_email,
  //     contact: {
  //       personal: {
  //         telephone: owner.contact_telephone,
  //         mobile: owner.contact_mobile,
  //       },
  //       home: {
  //         telephone: owner.contact_tel_home,
  //         mobile: owner.contact_mob_home,
  //       },
  //     },
  //     documents: owner.documents,
  //     active: owner.active,
  //     status: owner.status,
  //     remarks: owner.remarks,
  //     userId: owner.user_id,
  //     createdAt: owner.created_at,
  //     updatedAt: owner.updated_at,
  //   };
  // }

  // static async updateOwner(id, data) {
  //   const owner = await prisma.owners.findFirst({
  //     where: {
  //       id,
  //     },
  //   });

  //   if (!owner) {
  //     throw createError.NotFound("Owner not found.");
  //   }

  //   const updateOwner = await prisma.owners.update({
  //     where: { id: id },
  //     data: data,
  //   });

  //   return updateOwner;
  // }
}

module.exports = rolesService;

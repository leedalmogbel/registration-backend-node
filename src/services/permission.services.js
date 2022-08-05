const prisma = require("../utils/prisma");
require("dotenv").config();

const createError = require("http-errors");

class permissionService {
  static async create(data) {
    if (data.id === null || data.id === "undefined")
      throw createError.NotFound("Role not found.");
    console.log("asdasdasd", data);
    data = {
      actions: data.actions,
      active: true,
      roleId: data.id,
    };
    const perm = await prisma.permissions.create({
      data,
    });

    return perm;
  }

  static async fetchAll() {
    const allPerms = await prisma.permissions.findMany({});

    return allPerms;
  }
}

module.exports = permissionService;

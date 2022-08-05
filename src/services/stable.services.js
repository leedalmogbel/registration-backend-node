const prisma = require("../utils/prisma");
require("dotenv").config();

const createError = require("http-errors");

class stableService {
  static async create(data) {
    try {
      console.log("data", data);
      data = {
        ...data,
        userId: parseInt(data.userId),
      };
      const stable = await prisma.stables.create({
        data,
      });

      return stable;
    } catch (error) {
      console.log("error", error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async fetchAll(params) {
    try {
      let filter = {};
      // if ("id" in params) {
      //   filter = {
      //     userId: parseInt(params.id),
      //   };
      // }

      if ("active" in params) {
        filter = {
          ...filter,
          active: params.active === "true",
        };
      }

      let count = await prisma.stables.count({
        where: {
          ...filter,
        },
      });

      console.log("count", count);

      const allstable = await prisma.stables.findMany({
        where: {
          ...filter,
        },
        include: {
          users: true,
        }
      });

      return { data: allstable, count };
    } catch (error) {
      console.log("error", error);
    }
  }

  static async getStableDetail(id) {
    const stable = await prisma.stables.findFirst({
      where: {
        id,
      },
    });

    if (!stable) {
      throw createError.NotFound("stable not found.");
    }

    return stable;
  }

  static async updateStatus(id, status) {
    try {
      const stable = await prisma.stables.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      return stable;
    } catch (error) {
      console.log(error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async updateStable(id, data) {
    try {
      data = {
        ...data,
        userId: parseInt(data.userId),
      };
      // TODO: need more validations
      // const stable = await prisma.stable.findFirst({
      //   where: {
      //     id,
      //   },
      // });

      // if (!stable) {
      //   throw createError.NotFound("stable not found.");
      // }

      const stable = await prisma.stables.update({
        where: { id: id },
        data: data,
      });

      return stable;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = stableService;

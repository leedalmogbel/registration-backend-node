const prisma = require("../utils/prisma");
require("dotenv").config();

const createError = require("http-errors");

class seasonService {
  static async create(data) {
    try {
      console.log("data", data);
      data = { 
        ...data,
        // userId: parseInt(data.userId),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
      const season = await prisma.seasons.create({
        data,
      });

      return season;
    } catch (error) {
      console.log("error", error);
    }
  }

  static async fetchAll(params) {
    try {
      let filter = {};
      if ("id" in params) {
        filter = {
          userId: parseInt(params.id),
        };
      }

      if ("active" in params) {
        filter = {
          ...filter,
          active: params.active === "true",
        };
      }

      let count = await prisma.seasons.count({
        where: {
          ...filter,
        },
      });

      console.log("count", count);

      const allseason = await prisma.seasons.findMany({
        where: {
          ...filter,
        },
      });

      return { data: allseason, count };
    } catch (error) {
      console.log("error", error);
    }
  }

  static async getSeasonDetail(id) {
    const season = await prisma.seasons.findFirst({
      where: {
        id,
      },
    });

    if (!season) {
      throw createError.NotFound("season not found.");
    }

    return season;
  }

  static async updateStatus(id, status) {
    try {
      const season = await prisma.seasons.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      return season;
    } catch (error) {
      console.log(error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async updateSeason(id, data) {
    try {
      data = {
        ...data,
        userId: parseInt(data.userId),
      };
      // TODO: need more validations
      // const season = await prisma.season.findFirst({
      //   where: {
      //     id,
      //   },
      // });

      // if (!season) {
      //   throw createError.NotFound("season not found.");
      // }

      const season = await prisma.seasons.update({
        where: { id: id },
        data: data,
      });

      return season;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = seasonService;

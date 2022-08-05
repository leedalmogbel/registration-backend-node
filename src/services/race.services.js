const prisma = require("../utils/prisma");
require("dotenv").config();

const createError = require("http-errors");

class raceService {
  static async create(data) {
    try {
      data = {
        ...data,
        eventId: data.eventId ? parseInt(data.eventId) : null,
        startTime: data.startTime,
        eventDate: new Date(data.eventDate),
        openingDate: new Date(data.openingDate),
        closingDate: new Date(data.closingDate),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        allowedCount: parseInt(data.allowedCount || 150),
        isQualifier: data.isQualifier,
        pledge: data.pledge,
      };
      console.log('data',data)
      const race = await prisma.races.create({
        data,
      });

      return race;
    } catch (error) {
      console.log("error", error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async fetchAll(params) {
    try {
      let filter = {};
      console.log('services', params)
      if (parseInt(params.id) !== 1) {
        filter = {
          // userId: parseInt(params.id),
          status: 'approved',
          active: true,
          // eventDate: {
          //   gte: new Date()
          // }
        };
      }

      if ("active" in params) {
        filter = {
          ...filter,
          active: params.active === "true",
        };
      }

      let count = await prisma.races.count({
        where: {
          ...filter,
        },
      });

      console.log("count", count);

      const allraces = await prisma.races.findMany({
        where: {
          ...filter,
        },
        include: {
            events: true
        }
      });

      return { data: allraces, count };
    } catch (error) {
      console.log("error", error);
    }
  }

  static async getRaceDetail(id) {
    let race = await prisma.races.findFirst({
      where: {
        id,
      },
      include: {
        events: true
      }
    });

    if (!race) {
      throw createError.NotFound("race not found.");
    }

    race = {
      ...race,
      stables: race.metadata
    }

    return race;
  }

  static async updateStatus(id, status) {
    try {
      const race = await prisma.races.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      return race;
    } catch (error) {
      console.log(error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async updateRace(id, data) {
    try {
      const { racePdf, raceImg } = data;
      console.log(racePdf.file);
      if (!racePdf.file || Object.entries(racePdf.file).length === 0) {
        delete data.racePdf;
      }

      if (!raceImg.file || Object.entries(raceImg.file).length === 0) {
        delete data.raceImg;
      }

      data = {
        ...data,
        eventId: parseInt(data.eventId),
        startTime: data.startTime,
        eventDate: new Date(data.eventDate),
        openingDate: new Date(data.openingDate),
        closingDate: new Date(data.closingDate),
        allowedCount: parseInt(data.allowedCount || 150),
        isQualifier: data.isQualifier,
        pledge: data.pledge,
      };

      const race = await prisma.races.update({
        where: { id: id },
        data: data,
        include: {
          events: true
        }
      });

      return race;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = raceService;

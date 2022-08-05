const prisma = require("../utils/prisma");
require("dotenv").config();

const createError = require("http-errors");

class eventService {
  static async create(data) {
    console.log(data)
    try {
      data = {
        ...data,
        seasonId: parseInt(data.seasonId) || 1,
        userId: parseInt(data.userId),
        organizerId: parseInt(data.organizerId) || 1,
        startDate: new Date(data.startDate) || 1,
        endDate: new Date(data.endDate),
        status: data.status || 'approved'
      };
      const event = await prisma.events.create({
        data,
      });

      return event;
    } catch (error) {
      console.log("error", error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async fetchAll(params) {
    try {
      let filter = {};
      if ("id" in params) {
        console.log('asdasd', params)
        if (parseInt(params.id) !== 1) {
          filter = {
            // userId: parseInt(params.id),
            status: 'approved',
            active: true
          };
        }
      }

      if ("active" in params) {
        filter = {
          ...filter,
          active: params.active === "true",
        };
      }

      let count = await prisma.events.count({
        where: {
          ...filter,
        },
      });

      console.log("count", count);

      const allEvents = await prisma.events.findMany({
        where: {
          ...filter,
        },
        include: {
          races: true
        }
      });


      return { data: allEvents, count };
    } catch (error) {
      console.log("error", error);
    }
  }

  static async getEventDetail(id) {
    const event = await prisma.events.findFirst({
      where: {
        id,
      },
      include: {
          races: true
        }
    });

    if (!event) {
      throw createError.NotFound("event not found.");
    }

    return event;
  }

  static async updateStatus(id, status) {
    try {
      const event = await prisma.events.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      console.log(id, status)

      return event;
    } catch (error) {
      console.log(error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async updateEvent(id, data) {
    try {

      data = {
        ...data,
        seasonId: parseInt(data.seasonId || 1),
        userId: parseInt(data.userId),
        organizerId: parseInt(data.organizerId || 1),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || 'pending'
      };

      const event = await prisma.events.update({
        where: { id: id },
        data: data,
      });

      return event;
    } catch (error) {
      console.log(error);
    }
  }

  static async searchEventByName(id, query) {
    try {
      let filter = {};
      // if (parseInt(id) > 1) {
        filter = {
          // active: true,
          status: 'approved'
        };
      // } 

      let event = [];
      // if (parseInt(id) === 1) {
      //   event = await prisma.$queryRawUnsafe(`SELECT * FROM events where firstName LIKE '%${query}%' OR lastName LIKE '%${query}%'`);
      // } else {
        event = await prisma.$queryRawUnsafe(`SELECT * FROM events where name LIKE '%${query}%' AND status='approved'  `);
      // }
      
      console.log(filter)
      console.log(query)

      return { data: event, count: event.length };
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = eventService;

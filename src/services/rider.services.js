const prisma = require("../utils/prisma");
require("dotenv").config();

const createError = require("http-errors");

class riderService {
  static async create(data) {
    try {
      data = {
        ...data,
        userId: parseInt(data.userId),
        feiRegistrationDate: new Date(data.feiRegistrationDate),
      };
      const rider = await prisma.riders.create({
        data,
      });

      return rider;
    } catch (error) {
      console.log("error", error);
    }
  }

  static async fetchAll(params) {
    try {
      let filter = {};
      if ("id" in params && params.id !== "1") {
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

      // count = await prisma.$queryRaw`SELECT count(userId) FROM riders`
      // if (filter.userId > 1) {
      //   count = await prisma.$queryRaw`SELECT count(userId) FROM riders WHERE userId=${filter.userId}`
      // }

      // console.log('asdasd', count)
      // console.log('riders', count[0]['count(userId)']);
      let count = await prisma.riders.count({
        where: {
          ...filter,
        },
      });

      console.log("count", count);

      const allriders = await prisma.riders.findMany({
        where: {
          ...filter,
        },
      });

      let riders = allriders.map((rider) => ({
        id: rider.id,
        emiratesId: rider.emiratesId,
        discipline: rider.discipline,
        feiRegistration: {
          no: rider.feiRegistrationNo,
          date: rider.feiRegistrationDate,
        },
        visa: rider.visa,
        gender: rider.gender,
        firstName: rider.firstName,
        lastName: rider.lastName,
        dob: rider.dob,
        nationality: rider.nationality,
        address: {
          uae: {
            address: rider.uaeAddress,
            city: rider.uaeCity,
            country: rider.uaeCountry,
          },
          home: {
            address: rider.homeAddress,
            city: rider.homeCity,
            country: rider.homeCountry,
          },
        },
        pobox: rider.pobox,
        email: rider.contactEmail,
        contact: {
          personal: {
            telephone: rider.contactTelephone,
            mobile: rider.contactMobile,
          },
          home: {
            telephone: rider.contactTelHome,
            mobile: rider.contactMobHome,
          },
        },
        documents: rider.documents,
        active: rider.active,
        status: rider.status,
        remarks: rider.remarks,
        userId: rider.userId,
        createdAt: rider.createdAt,
        updatedAt: rider.updatedAt,
      }));

      return { data: riders, count };
    } catch (error) {
      console.log("error", error);
    }
  }

  static async getRiderDetail(id) {
    const rider = await prisma.riders.findFirst({
      where: {
        id,
      },
    });

    if (!rider) {
      throw createError.NotFound("rider not found.");
    }

    let newrider = {
      id: rider.id,
      emiratesId: rider.emiratesId,
      discipline: rider.discipline,
      feiRegistration: {
        no: rider.feiRegistrationNo,
        date: rider.feiRegistrationDate,
      },
      visa: rider.visa,
      gender: rider.gender,
      firstName: rider.firstName,
      lastName: rider.lastName,
      dob: rider.dob,
      nationality: rider.nationality,
      address: {
        uae: {
          address: rider.uaeAddress,
          city: rider.uaeCity,
          country: rider.uaeCountry,
        },
        home: {
          address: rider.homeAddress,
          city: rider.homeCity,
          country: rider.homeCountry,
        },
      },
      pobox: rider.pobox,
      email: rider.contactEmail,
      contact: {
        personal: {
          telephone: rider.contactTelephone,
          mobile: rider.contactMobile,
        },
        home: {
          telephone: rider.contactTelHome,
          mobile: rider.contactMobHome,
        },
      },
      documents: rider.documents,
      riderImage: rider.riderImage,
      active: rider.active,
      status: rider.status,
      remarks: rider.remarks,
      userId: rider.userId,
      createdAt: rider.createdAt,
      updatedAt: rider.updatedAt,
    };

    return newrider;
  }

  static async updateStatus(id, status) {
    try {
      const rider = await prisma.riders.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      return rider;
    } catch (error) {
      console.log(error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async updateRider(id, data) {
    try {
      const { documents } = data;
      console.log(data);
      if (Object.entries(documents.file).length === 0) {
        delete data.documents;
      }

      data = {
        ...data,
        userId: parseInt(data.userId),
        feiRegistrationDate: new Date(data.feiRegistrationDate),
      };
      // TODO: need more validations
      // const rider = await prisma.riders.findFirst({
      //   where: {
      //     id,
      //   },
      // });

      // if (!rider) {
      //   throw createError.NotFound("rider not found.");
      // }

      const rider = await prisma.riders.update({
        where: { id: id },
        data: data,
      });

      return rider;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = riderService;

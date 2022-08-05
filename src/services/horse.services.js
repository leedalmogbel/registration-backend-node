const prisma = require("../utils/prisma");
require("dotenv").config();

const createError = require("http-errors");

class horseService {
  static async create(data) {
    try {
      data = {
        ...data,
        userId: parseInt(data.userId),
        trainerId: parseInt(data.trainerId),
        ownerId: parseInt(data.ownerId),
        feiPassportExpiryDate: new Date(data.feiPassportExpiryDate),
        dob: new Date(data.dob),
      };

      let trainerExist = null;
      if (data.userId === 1) {
        trainerExist = await prisma.trainers.findMany({
          where: {
            id: data.trainerId,
          },
        });
      } else {
        trainerExist = await prisma.trainers.findMany({
          where: {
            userId: data.userId,
            id: data.trainerId,
          },
        });
      } 

      if (!trainerExist) {
        throw new Error("Trainer not found");
      }

      let ownerExist = null;
      if (data.userId === 1) {
        ownerExist = await prisma.owners.findFirst({
          where: {
            id: data.ownerId,
          },
        });
      } else {
        ownerExist = await prisma.owners.findFirst({
          where: {
            userId: data.userId,
            id: data.ownerId,
          },
        });
      }

      if (!ownerExist) {
        throw new Error("Owner not found");
      }

      const horse = await prisma.horses.create({
        data,
      });

      return horse;
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

      let count = await prisma.horses.count({
        where: {
          ...filter,
        },
      });

      console.log("count", count);

      const allhorses = await prisma.horses.findMany({
        where: {
          ...filter,
        },
      });

      let horses = allhorses.map((horse) => ({
        id: horse.id,
        name: horse.name,
        originalName: horse.originalName,
        countryBirth: horse.countryBirth,
        breed: horse.breed,
        breeder: horse.breeder,
        dob: horse.dob,
        gender: horse.gender,
        color: horse.color,
        microchipNum: horse.microchipNum,
        uelnNo: horse.uelnNo,
        countryResidence: horse.countryResidence,
        sire: horse.sire,
        dam: horse.dam,
        sireOfDam: horse.sireOfDam,
        feiRegistration: {
          passportNo: horse.feiPassportNo,
          date: horse.feiPassportExpiryDate,
          no: horse.feiRegistrationNo,
        },
        trainerId: horse.trainerId,
        ownerId: horse.ownerId,
        slug: horse.slug,
        metadata: horse.metadata,
        status: horse.status,
        active: horse.active,
        remarks: horse.remarks,
        email: horse.contactEmail,
        documents: horse.documents,
        userId: horse.userId,
        createdAt: horse.createdAt,
        updatedAt: horse.updatedAt,
      }));

      return { data: horses, count };
    } catch (error) {
      console.log("error", error);
    }
  }

  static async getHorseDetail(id) {
    const horse = await prisma.horses.findFirst({
      where: {
        id,
      },
    });

    if (!horse) {
      throw createError.NotFound("horse not found.");
    }

    let newhorse = {
      id: horse.id,
      name: horse.name,
      originalName: horse.originalName,
      countryBirth: horse.countryBirth,
      breed: horse.breed,
      breeder: horse.breeder,
      dob: horse.dob,
      gender: horse.gender,
      color: horse.color,
      microchipNum: horse.microchipNum,
      uelnNo: horse.uelnNo,
      countryResidence: horse.countryResidence,
      sire: horse.sire,
      dam: horse.dam,
      sireOfDam: horse.sireOfDam,
      feiRegistration: {
        passportNo: horse.feiPassportNo,
        date: horse.feiPassportExpiryDate,
        no: horse.feiRegistrationNo,
      },
      trainerId: horse.trainerId,
      ownerId: horse.ownerId,
      slug: horse.slug,
      metadata: horse.metadata,
      status: horse.status,
      active: horse.active,
      remarks: horse.remarks,
      email: horse.contactEmail,
      documents: horse.documents,
      userId: horse.userId,
      createdAt: horse.createdAt,
      updatedAt: horse.updatedAt,
    };

    return newhorse;
  }

  static async updateStatus(id, status) {
    try {
      const horse = await prisma.horses.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      return horse;
    } catch (error) {
      console.log(error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async updateHorse(id, data) {
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
      // const horse = await prisma.horses.findFirst({
      //   where: {
      //     id,
      //   },
      // });

      // if (!horse) {
      //   throw createError.NotFound("horse not found.");
      // }

      const horse = await prisma.horses.update({
        where: { id: id },
        data: data,
      });

      return horse;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = horseService;

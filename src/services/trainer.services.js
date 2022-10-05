const prisma = require("../utils/prisma");
require("dotenv").config();

const createError = require("http-errors");

class trainerService {
  static async create(data) {
    console.log("data", data);
    try {
      data = {
        ...data,
        userId: parseInt(data.userId),
        feiRegistrationDate: new Date(data.feiRegistrationDate),
      };
      const trainer = await prisma.trainers.create({
        data,
      });

      return trainer;
    } catch (error) {
      console.log("error", error);
    }
  }

  static async fetchAll(params) {
    try {
      let filter = {};
      if ("id" in params && parseInt(params.id) > 1) {
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

      let count = await prisma.trainers.count({
        where: {
          ...filter,
        },
      });

      console.log("count", count);

      const allTrainers = await prisma.trainers.findMany({
        where: {
          ...filter,
        },
      });

      let trainers = allTrainers.map((trainer) => ({
        id: trainer.id,
        emiratesId: trainer.emiratesId,
        discipline: trainer.discipline,
        feiRegistration: {
          no: trainer.feiRegistrationNo,
          date: trainer.feiRegistrationDate,
        },
        visa: trainer.visa,
        gender: trainer.gender,
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        dob: trainer.dob,
        nationality: trainer.nationality,
        address: {
          uae: {
            address: trainer.uaeAddress,
            city: trainer.uaeCity,
            country: trainer.uaeCountry,
          },
          home: {
            address: trainer.homeAddress,
            city: trainer.homeCity,
            country: trainer.homeCountry,
          },
        },
        pobox: trainer.pobox,
        email: trainer.contactEmail,
        contact: {
          personal: {
            telephone: trainer.contactTelephone,
            mobile: trainer.contactMobile,
          },
          home: {
            telephone: trainer.contactTelHome,
            mobile: trainer.contactMobHome,
          },
        },
        documents: trainer.documents,
        active: trainer.active,
        status: trainer.status,
        remarks: trainer.remarks,
        userId: trainer.userId,
        createdAt: trainer.createdAt,
        updatedAt: trainer.updatedAt,
      }));

      return { data: trainers, count };
    } catch (error) {
      console.log("error", error);
    }
  }

  static async getTrainerDetail(id) {
    const trainer = await prisma.trainers.findFirst({
      where: {
        id,
      },
    });

    if (!trainer) {
      throw createError.NotFound("Trainer not found.");
    }

    let newTrainer = {
      id: trainer.id,
      emiratesId: trainer.emiratesId,
      discipline: trainer.discipline,
      feiRegistration: {
        no: trainer.feiRegistrationNo,
        date: trainer.feiRegistrationDate,
      },
      visa: trainer.visa,
      gender: trainer.gender,
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      dob: trainer.dob,
      nationality: trainer.nationality,
      address: {
        uae: {
          address: trainer.uaeAddress,
          city: trainer.uaeCity,
          country: trainer.uaeCountry,
        },
        home: {
          address: trainer.homeAddress,
          city: trainer.homeCity,
          country: trainer.homeCountry,
        },
      },
      pobox: trainer.pobox,
      email: trainer.contactEmail,
      contact: {
        personal: {
          telephone: trainer.contactTelephone,
          mobile: trainer.contactMobile,
        },
        home: {
          telephone: trainer.contactTelHome,
          mobile: trainer.contactMobHome,
        },
      },
      documents: trainer.documents,
      active: trainer.active,
      status: trainer.status,
      remarks: trainer.remarks,
      userId: trainer.userId,
      createdAt: trainer.createdAt,
      updatedAt: trainer.updatedAt,
    };

    return newTrainer;
  }

  static async updateStatus(id, status) {
    try {
      const trainer = await prisma.trainers.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      return trainer;
    } catch (error) {
      console.log(error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async updateTrainer(id, data) {
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
      // const trainer = await prisma.trainers.findFirst({
      //   where: {
      //     id,
      //   },
      // });

      // if (!trainer) {
      //   throw createError.NotFound("trainer not found.");
      // }

      const trainer = await prisma.trainers.update({
        where: { id: id },
        data: data,
      });

      return trainer;
    } catch (error) {
      console.log(error);
    }
  }

  static async searchTrainerByName(id, query) {
    try {
      let filter = {};
      if (parseInt(id) > 1) {
        filter = {
          userId: parseInt(id),
        };
      } 
      
      let trainer = [];
      if (parseInt(id) === 1) {
        trainer = await prisma.$queryRawUnsafe(`SELECT * FROM trainers where firstName LIKE '%${query}%' OR lastName LIKE '%${query}%'`);
      } else {
        trainer = await prisma.$queryRawUnsafe(`SELECT * FROM trainers where (firstName LIKE '%${query}%' OR lastName LIKE '%${query}%') AND userId=${parseInt(id)}`);
      }
      
      console.log(filter)
      console.log('query', query)
      console.log('trainer', trainer)

      return { data: trainer, count: trainer.length };
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = trainerService;

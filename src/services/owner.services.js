const prisma = require("../utils/prisma");
require("dotenv").config();

const createError = require("http-errors");

class ownerService {
  static async create(data) {
    try {
      data = {
        ...data,
        userId: parseInt(data.userId),
        feiRegistrationDate: new Date(data.feiRegistrationDate),
      };
      const owner = await prisma.owners.create({
        data,
      });

      return owner;
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

      // count = await prisma.$queryRaw`SELECT count(userId) FROM owners`
      // if (filter.userId > 1) {
      //   count = await prisma.$queryRaw`SELECT count(userId) FROM owners WHERE userId=${filter.userId}`
      // }

      // console.log('asdasd', count)
      // console.log('owners', count[0]['count(userId)']);
      let count = await prisma.owners.count({
        where: {
          ...filter,
        },
      });

      console.log("count", count);

      const allOwners = await prisma.owners.findMany({
        where: {
          ...filter,
        },
      });

      let owners = allOwners.map((owner) => ({
        id: owner.id,
        emiratesId: owner.emiratesId,
        discipline: owner.discipline,
        feiRegistration: {
          no: owner.feiRegistrationNo,
          date: owner.feiRegistrationDate,
        },
        visa: owner.visa,
        gender: owner.gender,
        firstName: owner.firstName,
        lastName: owner.lastName,
        dob: owner.dob,
        nationality: owner.nationality,
        address: {
          uae: {
            address: owner.uaeAddress,
            city: owner.uaeCity,
            country: owner.uaeCountry,
          },
          home: {
            address: owner.homeAddress,
            city: owner.homeCity,
            country: owner.homeCountry,
          },
        },
        pobox: owner.pobox,
        email: owner.contactEmail,
        contact: {
          personal: {
            telephone: owner.contactTelephone,
            mobile: owner.contactMobile,
          },
          home: {
            telephone: owner.contactTelHome,
            mobile: owner.contactMobHome,
          },
        },
        documents: owner.documents,
        active: owner.active,
        status: owner.status,
        remarks: owner.remarks,
        userId: owner.userId,
        createdAt: owner.createdAt,
        updatedAt: owner.updatedAt,
      }));

      return { data: owners, count };
    } catch (error) {
      console.log("error", error);
    }
  }

  static async getOwnerDetail(id) {
    const owner = await prisma.owners.findFirst({
      where: {
        id,
      },
    });

    if (!owner) {
      throw createError.NotFound("Owner not found.");
    }

    let newOwner = {
      id: owner.id,
      emiratesId: owner.emiratesId,
      discipline: owner.discipline,
      feiRegistration: {
        no: owner.feiRegistrationNo,
        date: owner.feiRegistrationDate,
      },
      visa: owner.visa,
      gender: owner.gender,
      firstName: owner.firstName,
      lastName: owner.lastName,
      dob: owner.dob,
      nationality: owner.nationality,
      address: {
        uae: {
          address: owner.uaeAddress,
          city: owner.uaeCity,
          country: owner.uaeCountry,
        },
        home: {
          address: owner.homeAddress,
          city: owner.homeCity,
          country: owner.homeCountry,
        },
      },
      pobox: owner.pobox,
      email: owner.contactEmail,
      contact: {
        personal: {
          telephone: owner.contactTelephone,
          mobile: owner.contactMobile,
        },
        home: {
          telephone: owner.contactTelHome,
          mobile: owner.contactMobHome,
        },
      },
      documents: owner.documents,
      active: owner.active,
      status: owner.status,
      remarks: owner.remarks,
      userId: owner.userId,
      createdAt: owner.createdAt,
      updatedAt: owner.updatedAt,
    };

    return newOwner;
  }

  static async updateStatus(id, status) {
    try {
      const owner = await prisma.owners.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      return owner;
    } catch (error) {
      console.log(error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async updateOwner(id, data) {
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
      // const owner = await prisma.owners.findFirst({
      //   where: {
      //     id,
      //   },
      // });

      // if (!owner) {
      //   throw createError.NotFound("Owner not found.");
      // }

      const owner = await prisma.owners.update({
        where: { id: id },
        data: data,
      });

      return owner;
    } catch (error) {
      console.log(error);
    }
  }

  static async searchOwnerByName(id, query) {
    try {
      let filter = {};
      if (parseInt(id) > 1) {
        filter = {
          userId: parseInt(id),
        };
      } 

      let allOwners = [];
      if (parseInt(id) === 1) {
        allOwners = await prisma.$queryRawUnsafe(`SELECT * FROM owners where firstName LIKE '%${query}%' OR lastName LIKE '%${query}%'`);
      } else {
        allOwners = await prisma.$queryRawUnsafe(`SELECT * FROM owners where (firstName LIKE '%${query}%' OR lastName LIKE '%${query}%') AND userId=${parseInt(id)}`);
      }
      
      let owners = allOwners.map((owner) => ({
        id: owner.id,
        emiratesId: owner.emiratesId,
        discipline: owner.discipline,
        feiRegistration: {
          no: owner.feiRegistrationNo,
          date: owner.feiRegistrationDate,
        },
        visa: owner.visa,
        gender: owner.gender,
        firstName: owner.firstName,
        lastName: owner.lastName,
        dob: owner.dob,
        nationality: owner.nationality,
        address: {
          uae: {
            address: owner.uaeAddress,
            city: owner.uaeCity,
            country: owner.uaeCountry,
          },
          home: {
            address: owner.homeAddress,
            city: owner.homeCity,
            country: owner.homeCountry,
          },
        },
        pobox: owner.pobox,
        email: owner.contactEmail,
        contact: {
          personal: {
            telephone: owner.contactTelephone,
            mobile: owner.contactMobile,
          },
          home: {
            telephone: owner.contactTelHome,
            mobile: owner.contactMobHome,
          },
        },
        documents: owner.documents,
        active: owner.active,
        status: owner.status,
        remarks: owner.remarks,
        userId: owner.userId,
        createdAt: owner.createdAt,
        updatedAt: owner.updatedAt,
      }));

      return { data: owners, count: owners.length };
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = ownerService;

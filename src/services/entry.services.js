const prisma = require("../utils/prisma");
require("dotenv").config();
const otpGenerator = require('otp-generator');
const createError = require("http-errors");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const twilioClient = require('twilio')(accountSid, authToken);

class entryService {
  static async create(payload) {
    console.log('york new city', payload.entries.length)
    console.log('payload', payload)
    let data = [];
    let _entry = {};

    try {
      if (payload.entries.length > 0) {
        payload.entries.forEach((entry) => {
          let { horse, rider, ...rest } = entry;
          console.log('|||||||||||||||||', rest)
          rest.horseId = parseInt(horse.value),
          rest.riderId = parseInt(rider.value),
          rest.userId = parseInt(payload.userId),
          rest.eventId = parseInt(payload.eventId),
          rest.raceId = parseInt(payload.raceId),
          rest.status = payload.status,
          rest.active = payload.active,
          console.log('============================', rest)
          data.push({...rest})
          console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxx', data)
        })
        console.log('aaadddddqweqweqwe', data)
      }

      await Promise.all(data.map(async (dt) => {
        const entryExist = await prisma.entries.findFirst({
          where: {
            eventId: parseInt(dt.eventId),
            horseId: parseInt(dt.horseId),
            riderId: parseInt(dt.riderId)
          }
        });

        if (entryExist) {
          throw new Error("Entry already exists!", 409);
        }
        
      }))

      _entry  = await prisma.entries.createMany({
        data,
      });
console.log(_entry)
      return _entry;
    } catch (error) {
      console.log("error", error);
      throw new Error(error.message, 400);
    }
  }

  static async fetchAll(params) {
    try {
      let filter = {};
      let query = params.query ? params.query : {};
      console.log('params0', params)
      if ('query' in params && params.query !== 'raceId') {
        console.log('query', query)
        filter = {
          ...filter,
          raceId: parseInt(query),
        };
      }
      if ("id" in params) {
        let user = await prisma.users.findFirst({
          where: {
            id: parseInt(params.id),
          }
        });

        if (user.userType === 'User') {
          filter = {
            ...filter,
            userId: parseInt(params.id),
            // status: 'approved',
            // races: {
            //   eventDate: {
            //     gte: new Date()
            //   }
            // }
          };
        }
      }

      if ("active" in params) {
        filter = {
          ...filter,
          active: params.active === "true",
        };
      }

      let count = await prisma.entries.count({
        where: {
          ...filter,
        },
      });

      console.log("count", count);
      console.log("filter", filter);

      const allEntries = await prisma.entries.findMany({
        where: {
          ...filter,
        },
        include: {
          users: true,
          horses: true,
          riders: true,
          races: {
            include: {
              events: true
            }
          }
        }
      });

      return { data: allEntries, count };
    } catch (error) {
      console.log("error", error);
    }
  }

  static async getEntryDetail(id) {
    const entry = await prisma.entries.findFirst({
      where: {
        id,
      },
      include: {
        users: true,
        horses: true,
        riders: true,
        races: {
          include: {
            events: true
          }
        }
      }
    });

    console.log('ENTRA', entry)

    if (!entry) {
      throw createError.NotFound("entry not found.");
    }

    return entry;
  }

  static async updateStatus(id, params) {
    let seqCount = 0;
    try {
      const list = await prisma.entries.findFirst({
        where: {
          sequence: {
            not: 0
          },
          raceId: parseInt(params.raceId),
        },
        orderBy: {
          approvedAt: 'desc'
        }
      });

      seqCount = 1;
      if (list) {
        seqCount = list.sequence + 1;
      }
      

      console.log('list', list)
      const entry = await prisma.entries.update({
        where: {
          id,
        },
        data: {
          status: params.status,
          approvedAt: new Date(),
          sequence: seqCount,
        },
      });

      console.log('ent11ry', entry)

      return entry;
    } catch (error) {
      console.log(error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async updateEntryList(raceId, entries) {
    try {
      entries.forEach(async (entry) => {
        const detail = await prisma.entries.update({
          where: {
            id: entry.id,
          },
          data: {
            sequence: entry.sequence,
          },
        });
      })
      

      console.log('list', entries)

      return entries;
    } catch (error) {
      console.log(error);
      throw new Error("Contact Administration", 400);
    }
  }

  static async updateEvent(id, data) {
    try {
      const { documents, image } = data;
      console.log(data);
      console.log(image);
      if (Object.entries(documents.file).length === 0) {
        delete data.documents;
      }

      data = {
        ...data,
        seasonId: parseInt(data.seasonId),
        restdays: parseInt(data.restdays),
        eventDate: new Date(data.eventDate),
        openingDate: new Date(data.openingDate),
        closingDate: new Date(data.closingDate),
        maxAllowedeHorseStable: parseInt(data.maxAllowedeHorseStable),
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

  static async fetchList(id) {
    try {
      let filter = {};
      console.log('params0', id)
      // if ('query' in params && params.query !== 'raceId') {
      //   console.log('query', query)
      //   filter = {
      //     ...filter,
      //     raceId: parseInt(query),
      //   };
      // }
      if (id) {
        // let user = await prisma.users.findFirst({
        //   where: {
        //     id: parseInt(params.id),
        //   }
        // });

        filter = {
          ...filter,
          raceId: parseInt(id),
        }

        // if (user.userType === 'User') {
        //   filter = {
        //     ...filter,
        //     userId: parseInt(params.id),
            // status: 'approved',
            // races: {
            //   eventDate: {
            //     gte: new Date()
            //   }
            // }
        //   };
        // }
      }

      // if ("active" in params) {
      //   filter = {
      //     ...filter,
      //     active: params.active === "true",
      //   };
      // }

      console.log("filter", filter);

      const allEntries = await prisma.entries.findMany({
        where: {
          ...filter,
        },
        orderBy: {
          approvedAt: 'desc',
          sequence: 'asc'
        },
        include: {
          users: true,

          horses: true,
          riders: true,
          races: {
            include: {
              events: true
            }
          }
        }
      });

      return allEntries;
    } catch (error) {
      console.log("error", error);
    }
  }

  static async fetchManageEntries(params) {
    try {
      let filter = {};
      console.log('params0', params)
      if ('query' in params) {

        filter = {
          ...filter,
          raceId: parseInt(params.query),
          // status: 'approved'
        }
      }

      console.log("filter", filter);

      const allEntries = await prisma.entries.findMany({
        where: {
          ...filter,
        },
        orderBy: {
          sequence: 'asc'
        },
        include: {
          users: {
            include: {
              stables: true,
            }
          },
          horses: true,
          riders: true,
          races: {
            include: {
              events: true
            }
          }
        }
      });

      return allEntries;
    } catch (error) {
      console.log("error", error);
    }
  }

  static async getEntriesByRaceId(raceId) {
    try {
      let filter = {};
      
      const allEntries = await prisma.entries.findMany({
        where: {
          raceId: raceId,
        },
        orderBy: {
          sequence: 'asc'
        },
        include: {
          users: {
            include: {
              stables: true,
            }
          },
          horses: true,
          riders: true,
          races: {
            include: {
              events: true
            }
          }
        }
      });

      let _entries = allEntries.map((entry) => {
        return {
          id: entry.id,
          startNumber: entry.sequence,
          horseName: entry.horses.name,
          horseEef: entry.horses.eefId || '',
          horseFei: entry.horses.feiId || '',
          riderName: `${entry.riders.firstName} ${entry.riders.lastName}`,
          riderEef: entry.riders.eefId || '',
          riderFei: entry.riders.feiId || '',
          mobileNumber: entry.users.mobile || '',
        }
      });

      return _entries;
    } catch (error) {
      console.log("error", error);
    }
  }

  static async saveOtp (entryId) {
    try {
      let otp = '';
      otp = otpGenerator.generate(10, {
          digits: true,
          lowerCaseAlphabets: false,
          upperCaseAlphabets: false,
          specialChars: false,
      });

      const otpExist = await prisma.otp.findFirst({
          where: {
            otp
          }
      });
console.log(otpExist) // TODO: validation on otpExist
      const detail = await prisma.entries.findFirst({
        where: {
          id: entryId,
        },
        include: {
          users: true,
        }
      });

      let data = {
        otp,
        mobile: detail.users.mobile || '' ,
        type: 'kiosk'
      }
      const results = await prisma.otp.create({
          data
      })
      // TODO: setup queue job for sending otp for mobile user
      twilioClient.messages 
        .create({   
          body: `Kiosk OTP is ${otp} `,
          messagingServiceSid: 'MG2b9dc718783a336cae6b16c6097a6be6',      
          to: `${detail.users.mobile}` 
        }) 
        .then(message => console.log(message.sid))
        .catch((error) => { console.log(`error twilio otp ${error}`)})
        .done();
  
      return results;
    } catch (error) {
      console.log("error", error);
      throw new Error(error.message, 400);
    }
  }

  static async verifyEntryOtp(otp) {
    try {
      const verified = await prisma.otp.findFirst({
        where: {
          otp
        }
      })

      if (!verified) {
        throw new Error('Invalid OTP', 400);
      }

      const qqq = await prisma.otp.update({
        where: {
          id: verified.id
        },
        data: {
          isExpired: true,
        },
      });

      console.log('verified', qqq)
      return verified;
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = entryService;

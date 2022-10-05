const prisma = require("../utils/prisma");
require("dotenv").config();
const moment = require('moment');
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
            raceId: parseInt(dt.raceId),
            userId: parseInt(dt.userId),
            horseId: parseInt(dt.horseId),
            riderId: parseInt(dt.riderId)
          }
        });
console.log(entryExist,'check')
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

  // TODO: export final list, pending list
  // TODO: logic# lessthan or equal to allowed count = final list
  // TODO: else pending list
  static async fetchPdfList(id, type) {
    try {
      let filter = {};
      let allowedCount = 0;
      let raceTitle = '';
      let date = '';
      let raceCode = '';
      console.log('params0', id)
      console.log('params1', type)
      // if ('query' in params && params.query !== 'raceId') {
      //   console.log('query', query)
      //   filter = {
      //     ...filter,
      //     raceId: parseInt(query),
      //   };
      if (type) {
        const race = await prisma.races.findFirst({ where: { id: parseInt(id) }});
        console.log('rarararace', moment(race.eventDate).format('MMMM Do YYYY, h:mm:ss a'))
        allowedCount = race.allowedCount;
        raceTitle = race.name;
        date = moment(race.eventDate).format('MMMM Do YYYY, h:mm:ss a');
        raceCode = race.raceCode || 'CEI';
      }
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

      if (type === 'accepted') {
        filter = {
          ...filter,
          // sequence: {
          //   lte: allowedCount
          // }
          status: 'approved'
        }
      } else {
        filter = {
          ...filter,
          // sequence: {
          //   gte: allowedCount
          // }
          status: 'pending'
        }
      }

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
              stables: true
            }
          },

          horses: {
            include: {
              trainers: true,
              owners: true,
            }
          },
          riders: true,
          races: {
            include: {
              events: true
            }
          }
        }
      });

      // console.log('ALL ENTRIES', allEntries)
      // console.log('ALL ENTRIES', allEntries.length)
      let entries = allEntries.map((entry, i) => ({
          SERIES: i+1,
          STAT: `${(entry.status).toUpperCase()}\nEIEV-${entry.id}`,
          HORSE: `${entry?.horses?.name} ${entry?.horses?.originalName}\n ${entry?.horses?.feiId} / ${entry?.horses?.eefId} / ${entry?.horses?.countryBirth}`,
          RIDER: `${entry?.riders?.firstName} ${entry?.riders?.lastName}\n ${entry?.horses?.feiId} / ${entry?.horses?.eefId}`,
          'CLUB/TRAINER': `${entry?.users?.stables?.name}\n ${entry?.horses?.trainers?.firstName} ${entry?.horses?.trainers?.lastName}\n` ,
          REMARKS: `TEST${i}`,
      }));
      // let entries = [];
      // if (type === 'accepted') {
      //   entries = [
      //     {
      //       SERIES:'1',
      //       STAT: 'ACCEPTED\nEIEV-21',
      //       HORSE: 'Ixion Lambert\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Sameer Shafiq\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'2',
      //       STAT: 'ACCEPTED\nEIEV-20',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah Hikmat Abdullah Hikmat Abdullah Hikmat Abdullah Hikmat Abdullah Hikmat Abdullah Hikmat Abdullah Hikmat Abdullah Hikmat Abdullah Hikmat Abdullah Hikmat Abdullah Hikmat Abdullah Hikmat Abdullah Hikmat Abdullah Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'3',
      //       STAT: 'ACCEPTED\nEIEV-19',
      //       HORSE: 'Demacia Celestial Dragon\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'4',
      //       STAT: 'ACCEPTED\nEIEV-23',
      //       HORSE: 'Flash Speed\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Robert  Buchanan\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'5',
      //       STAT: 'ACCEPTED\nEIEV-22',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Callie Sewell\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'6',
      //       STAT: 'ACCEPTED\nEIEV-21',
      //       HORSE: 'Ixion Lambert\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Sameer Shafiq\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'7',
      //       STAT: 'ACCEPTED\nEIEV-20',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'8',
      //       STAT: 'ACCEPTED\nEIEV-19',
      //       HORSE: 'Demacia Celestial Dragon\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'9',
      //       STAT: 'ACCEPTED\nEIEV-23',
      //       HORSE: 'Flash Speed\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Robert  Buchanan\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'10',
      //       STAT: 'ACCEPTED\nEIEV-22',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Callie Sewell\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'11',
      //       STAT: 'ACCEPTED\nEIEV-21',
      //       HORSE: 'Ixion Lambert\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Sameer Shafiq\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'12',
      //       STAT: 'ACCEPTED\nEIEV-20',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'13',
      //       STAT: 'ACCEPTED\nEIEV-19',
      //       HORSE: 'Demacia Celestial Dragon\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'14',
      //       STAT: 'ACCEPTED\nEIEV-22',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Callie Sewell\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'15',
      //       STAT: 'ACCEPTED\nEIEV-21',
      //       HORSE: 'Ixion Lambert\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Sameer Shafiq\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'16',
      //       STAT: 'ACCEPTED\nEIEV-20',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'17',
      //       STAT: 'ACCEPTED\nEIEV-19',
      //       HORSE: 'Demacia Celestial Dragon\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'18',
      //       STAT: 'ACCEPTED\nEIEV-23',
      //       HORSE: 'Flash Speed\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Robert  Buchanan\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'19',
      //       STAT: 'ACCEPTED\nEIEV-22',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Callie Sewell\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'20',
      //       STAT: 'ACCEPTED\nEIEV-21',
      //       HORSE: 'Ixion Lambert\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Sameer Shafiq\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'21',
      //       STAT: 'ACCEPTED\nEIEV-20',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'22',
      //       STAT: 'ACCEPTED\nEIEV-19',
      //       HORSE: 'Demacia Celestial Dragon\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'23',
      //       STAT: 'ACCEPTED\nEIEV-23',
      //       HORSE: 'Flash Speed\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Robert  Buchanan\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'24',
      //       STAT: 'ACCEPTED\nEIEV-22',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Callie Sewell\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'25',
      //       STAT: 'ACCEPTED\nEIEV-21',
      //       HORSE: 'Ixion Lambert\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Sameer Shafiq\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'26',
      //       STAT: 'ACCEPTED\nEIEV-20',
      //       HORSE: 'M2inotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'27',
      //       STAT: 'ACCEPTED\nEIEV-19',
      //       HORSE: 'Demacia Celestial Dragon\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'28',
      //       STAT: 'ACCEPTED\nEIEV-23',
      //       HORSE: 'Flash Speed\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Robert  Buchanan\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'29',
      //       STAT: 'ACCEPTED\nEIEV-22',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Callie Sewell\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'30',
      //       STAT: 'ACCEPTED\nEIEV-21',
      //       HORSE: 'Ixion Lambert\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Sameer Shafiq\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'31',
      //       STAT: 'ACCEPTED\nEIEV-20',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'32',
      //       STAT: 'ACCEPTED\nEIEV-19',
      //       HORSE: 'Demacia Celestial Dragon\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'33',
      //       STAT: 'ACCEPTED\nEIEV-23',
      //       HORSE: 'Flash Speed\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Robert  Buchanan\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'34',
      //       STAT: 'ACCEPTED\nEIEV-22',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Callie Sewell\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'35',
      //       STAT: 'ACCEPTED\nEIEV-21',
      //       HORSE: 'Ixion Lambert\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Sameer Shafiq\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'36',
      //       STAT: 'ACCEPTED\nEIEV-20',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'37',
      //       STAT: 'ACCEPTED\nEIEV-19',
      //       HORSE: 'Demacia Celestial Dragon\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'38',
      //       STAT: 'ACCEPTED\nEIEV-23',
      //       HORSE: 'Flash Speed\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Robert  Buchanan\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'39',
      //       STAT: 'ACCEPTED\nEIEV-22',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Callie Sewell\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },{
      //       SERIES:'40',
      //       STAT: 'ACCEPTED\nEIEV-21',
      //       HORSE: 'Ixion Lambert\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Sameer Shafiq\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'41',
      //       STAT: 'ACCEPTED\nEIEV-20',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'42',
      //       STAT: 'ACCEPTED\nEIEV-19',
      //       HORSE: 'Demacia Celestial Dragon\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'43',
      //       STAT: 'ACCEPTED\nEIEV-23',
      //       HORSE: 'Flash Speed\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Robert  Buchanan\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'44',
      //       STAT: 'ACCEPTED\nEIEV-22',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Callie Sewell\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'45',
      //       STAT: 'ACCEPTED\nEIEV-21',
      //       HORSE: 'Ixion Lambert\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Sameer Shafiq\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'46',
      //       STAT: 'ACCEPTED\nEIEV-20',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'47',
      //       STAT: 'ACCEPTED\nEIEV-19',
      //       HORSE: 'Demacia Celestial Dragon\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'48',
      //       STAT: 'ACCEPTED\nEIEV-23',
      //       HORSE: 'Flash Speed\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Robert  Buchanan\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'49',
      //       STAT: 'ACCEPTED\nEIEV-22',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Callie Sewell\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },{
      //       SERIES:'50',
      //       STAT: 'ACCEPTED\nEIEV-21',
      //       HORSE: 'Ixion Lambert\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Sameer Shafiq\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'51',
      //       STAT: 'ACCEPTED\nEIEV-20',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'52',
      //       STAT: 'ACCEPTED\nEIEV-19',
      //       HORSE: 'Demacia Celestial Dragon\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'53',
      //       STAT: 'ACCEPTED\nEIEV-23',
      //       HORSE: 'Flash Speed\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Robert  Buchanan\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'54',
      //       STAT: 'ACCEPTED\nEIEV-22',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Callie Sewell\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     }
      //   ];
      // } else if (type === 'pending') {
      //     entries = [{
      //       SERIES:'1',
      //       STAT: 'PENDING\nEIEV-21',
      //       HORSE: 'Ixion Lambert\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Sameer Shafiq\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'2',
      //       STAT: 'PENDING\nEIEV-20',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'3',
      //       STAT: 'PENDING\nEIEV-19',
      //       HORSE: 'Demacia Celestial Dragon\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'4',
      //       STAT: 'PENDING\nEIEV-23',
      //       HORSE: 'Flash Speed\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Robert  Buchanan\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'5',
      //       STAT: 'PENDING\nEIEV-22',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Callie Sewell\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },{
      //       SERIES:'6',
      //       STAT: 'PENDING\nEIEV-21',
      //       HORSE: 'Ixion Lambert\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Sameer Shafiq\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'7',
      //       STAT: 'PENDING\nEIEV-20',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'8',
      //       STAT: 'PENDING\nEIEV-19',
      //       HORSE: 'Demacia Celestial Dragon\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Hikmat Abdullah\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'9',
      //       STAT: 'PENDING\nEIEV-23',
      //       HORSE: 'Flash Speed\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Robert  Buchanan\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'10',
      //       STAT: 'PENDING\nEIEV-22',
      //       HORSE: 'Minotaur Noxious\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Callie Sewell\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     },
      //     {
      //       SERIES:'11',
      //       STAT: 'PENDING\nEIEV-23',
      //       HORSE: 'Flash Speed\n EEF-ENDH-0019036 / 104YD41 / UAE',
      //       RIDER: 'Robert  Buchanan\n EEF-ENDR-0018679 / 10255512',
      //       'CLUB/TRAINER': 'Al Wathba Stable 2\n Derrick  Johnson\n',
      //       REMARKS: ''
      //     }
      //   ];
      // }

      console.log(entries)

      return { lists: entries, count: entries.length, title: raceTitle, code: raceCode, date:date };
    } catch (error) {
      console.log("error", error);
    }
  }

  static async fetchXlsList(id, type) {
    try {
      let filter = {};
      let allowedCount = 0;
      let raceTitle = '';
      console.log('params0', id)
      console.log('params1', type)
      if (type) {
        const race = await prisma.races.findFirst({ where: { id: parseInt(id) }});
        console.log('racrace', race)
        allowedCount = race.allowedCount;
        raceTitle = race.name;
      }
      if (id) {
        filter = {
          ...filter,
          raceId: parseInt(id),
        }
      }

      if (type === 'accepted') {
        filter = {
          ...filter,
          // sequence: {
          //   lte: allowedCount
          // }
          status: 'approved'
        }
      } else {
        filter = {
          ...filter,
          // sequence: {
          //   gt: allowedCount
          // }
          status: 'pending'
        }
      }

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
              stables: true
            }
          },

          horses: {
            include: {
              trainers: true,
              owners: true,
            }
          },
          riders: true,
          races: {
            include: {
              events: true
            }
          }
        }
      });

      // console.log('ALL ENTRIES', allEntries)
      // console.log('ALL ENTRIES', allEntries.length)
      let entries = allEntries.map((entry, i) => ({
          series: i+1,
          status: `${(entry.status).toUpperCase()}\nEIEV-${entry.id}`,
          horse: `${entry?.horses?.name} ${entry?.horses?.originalName}\n ${entry?.horses?.feiId} / ${entry?.horses?.eefId} / ${entry?.horses?.countryBirth}`,
          rider: `${entry?.riders?.firstName} ${entry?.riders?.lastName}\n ${entry?.horses?.feiId} / ${entry?.horses?.eefId}`,
          stable: entry?.users?.stables?.name,
          eefFeiHorse: `${entry?.horses?.feiId} / ${entry?.horses?.eefId}`,
          eefFeiRider: `${entry?.riders?.feiId} / ${entry?.riders?.eefId} / ${entry?.riders?.homeCountry}`,
          trainer: `${entry?.horses?.trainers?.firstName} ${entry?.horses?.trainers?.lastName}` ,
      }));

      return { lists: entries, count: entries.length, title: raceTitle };
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

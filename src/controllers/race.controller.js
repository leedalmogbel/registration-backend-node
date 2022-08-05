const race = require("../services/race.services");
const event = require("../services/event.services");
const prisma = require("../utils/prisma");
const createError = require("http-errors");
const { ip } = require("../utils/helpers");

class raceController {
  static store = async (req, res, next) => {
    try {
      let data = {}
      if ('data' in req.body) {
        data = JSON.parse(req.body.data);
      } else {
        data = req.body;
      }
      console.log('req.body.data', data)

      const { eventTitle, eventCreate, country, eventName, eventDesc, userId, documentExpiry, ...rest } = data;
      const files = req.files || {};

      const file = (files.file && files.file[0]) || null;
      const photo = (files.photo && files.photo[0]) || null;

      data = {
        ...rest,
        racePdf: {
          file: file,
          filePath: (file && `http://${ip}:7331/${file.path}`) || '',
        },
        raceImg: {
          file: photo,
          filePath: (photo && `http://${ip}:7331/${photo.path}`) || '',
         }
      };

      if (data.eventId) {
        const eventInfo = await prisma.events.findFirst({
          where: {
            id: data.eventId,
          }
        });

        data = {
          ...data,
          eventId: eventInfo.id,
          location: eventInfo.location,
          country: eventInfo.country,
          startDate: eventInfo.startDate,
          endDate: eventInfo.startDate,
        }
      }

      let eventData = {};
      if (eventCreate) {
        let eventDetail = {};
        
        eventDetail = {
          userId: parseInt(userId) || 1,
          country: country,
          location: data.location,
          startDate: data.startDate,
          endDate: data.endDate,
          name: eventTitle,
          description: eventDesc,
        }

        eventData = await event.create(eventDetail);
        console.log(eventData);

        data = {
          ...data,
          location: data.location,
          country: country,
          eventId: eventData.id,
          startDate: data.startDate,
          endDate: data.endDate,
        }
      }

      const response = await race.create(data);

      res.status(200).json({
        status: true,
        message: "race Created successfully",
        data: response,
      });
    } catch (err) {
      console.log("errasdasd", err);
      next(createError(err.statusCode, err.message));
    }
  };

  static list = async (req, res, next) => {
    try{
      const params = req.query;

      const { data, count } = await race.fetchAll(params);
      res.status(200).json({
        status: "success",
        data,
        count,
      });
    } catch (err) {
      next(createError(err.statusCode, err.message));
    }
  };

  static show = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await race.getRaceDetail(parseInt(id));
      res.status(200).json({
        status: true,
        message: "Fetch race",
        data,
      });
    } catch (err) {
      console.log("error", err)
      next(createError(err.statusCode, err.message));
    }
  };

  static update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      let data = {}
      if ('data' in req.body) {
        data = JSON.parse(req.body.data);
      } else {
        data = req.body;
      }

      const { userId, documentExpiry, ...rest } = data;
      const files = req.files || {};

      const file = (files.file && files.file[0]) || null;
      const photo = (files.photo && files.photo[0]) || null;

      data = {
        ...rest,
        racePdf: {
          file: file,
          filePath: (file && `http://${ip}:7331/${file.path}`) || '',
        },
        raceImg: {
          file: photo,
          filePath: (photo && `http://${ip}:7331/${photo.path}`) || '',
         }
      };
      const detail = await race.updateRace(id, data);
      res.status(200).json({
        status: true,
        message: "race updated successfully",
        data: detail,
      });
    } catch (err) {
      console.log("err", err);
      next(createError(err.statusCode, err.message));
    }
  };

  static updateStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const status = req.body.status;

      const data = await race.updateStatus(parseInt(id), status);
      res.status(200).json({
        status: true,
        message: "race status updated",
        data,
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };
}

module.exports = raceController;

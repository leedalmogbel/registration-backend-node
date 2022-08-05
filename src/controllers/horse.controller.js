const horse = require("../services/horse.services");
const createError = require("http-errors");
const { ip } = require("../utils/helpers");

class horseController {
  static store = async (req, res, next) => {
    try {
      let data = {}
      if ('data' in req.body) {
        data = JSON.parse(req.body.data);
        const { documentExpiry, ...rest } = data;
        const file = req.file || {};

        data = {
          ...rest,
          documents: {
            documentExpiry: documentExpiry,
            file: file,
            filePath: `http://${ip}:7331/${file.path}`,
          },
        };
      } else {
        data = req.body;
      }

      const response = await horse.create(data);

      res.status(200).json({
        status: true,
        message: "horse Created successfully",
        data: response,
      });
    } catch (err) {
      console.log("error", err);
      next(createError(err.statusCode, err.message));
    }
  };

  static list = async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      const { data, count } = await horse.fetchAll(params);
      res.status(200).json({
        status: true,
        messsage: "Fetch all horses",
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
      const data = await horse.getHorseDetail(parseInt(id));
      res.status(200).json({
        status: true,
        message: "Fetch horse",
        data,
      });
    } catch (err) {
      console.log("THIS!!!", err);
      res.status(404).json({
        error: true,
        message: err.message,
      });
    }
  };

  static update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      let { data } = req.body;
      data = JSON.parse(data);

      const { documentExpiry, ...rest } = data;
      const file = req.file || {};

      data = {
        ...rest,
        documents: {
          documentExpiry: documentExpiry,
          file: file,
          filePath: `http://${ip}:7331/${file.path}`,
        },
      };
      const detail = await horse.updateHorse(id, data);
      res.status(200).json({
        status: true,
        message: "horse updated successfully",
        data: detail,
      });
    } catch (err) {
      console.log("THIS!!!", err);
      res.status(404).json({
        error: true,
        message: err.message,
      });
    }
  };

  static updateStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const status = req.body.status;
      console.log(id, status);
      const data = await horse.updateStatus(parseInt(id), status);
      console.log(data);
      res.status(200).json({
        status: true,
        message: "horse status updated",
        data,
      });
    } catch (error) {
      console.log("THIS!!!", err);
      res.status(404).json({
        error: true,
        message: err.message,
      });
    }
  };
}

module.exports = horseController;

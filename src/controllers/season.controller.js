const season = require("../services/season.services");
const createError = require("http-errors");
const { ip } = require("../utils/helpers");

class seasonController {
  static store = async (req, res, next) => {
    try {
      let data = {}
      if ('data' in req.body) {
        data = JSON.parse(req.body);
      } else {
        data = req.body;
      }
      const response = await season.create(data);

      res.status(200).json({
        status: true,
        message: "season Created successfully",
        data: response,
      });
    } catch (err) {
      console.log("errasdasd", err);
      next(createError(err.statusCode, err.message));
    }
  };

  static list = async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      const { data, count } = await season.fetchAll(params);
      res.status(200).json({
        status: true,
        messsage: "Fetch all seasons",
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
      const data = await season.getSeasonDetail(parseInt(id));
      res.status(200).json({
        status: true,
        message: "Fetch season",
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
      let { data } = req.body;
      data = JSON.parse(data);

      const detail = await season.updateSeason(id, data);
      res.status(200).json({
        status: true,
        message: "season updated successfully",
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

      const data = await season.updateStatus(parseInt(id), status);
      res.status(200).json({
        status: true,
        message: "season status updated",
        data,
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };
}

module.exports = seasonController;

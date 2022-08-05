const event = require("../services/event.services");
const createError = require("http-errors");
const { ip } = require("../utils/helpers");

class eventController {
  static store = async (req, res, next) => {
    try {
      let data = {};
      if ('data' in req.body) {
        data = JSON.parse(req.body.data);
      } else {
        data = req.body;
      }
      const response = await event.create(data);

      res.status(200).json({
        status: true,
        message: "event Created successfully",
        data: response,
      });
    } catch (err) {
      console.log("error1", err);
      res.status(404).json({
        error: true,
        message: err.message,
      });
    }
  };

  static list = async (req, res, next) => {
    try {
      if ('query' in req.query) {
        const { id, query } = req.query;

        const { data, count } = await event.searchEventByName(parseInt(id), query);
        res.status(200).json({
          status: "success",
          data,
          count
        });
      } else {
        const params = req.query;

        const { data, count } = await event.fetchAll(params);
        res.status(200).json({
          status: "success",
          data,
          count,
        });
      }
    } catch (err) {
        res.status(404).json({
            error: true,
            message: err.message,
        });
    }
  };

  static show = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await event.getEventDetail(parseInt(id));
      res.status(200).json({
        status: true,
        message: "Fetch Event",
        data,
      });
    } catch (err) {
      console.log("error", err)
      next(createError(err.statusCode, err.message));
    }
  };

  static update = async (req, res, next) => {
    try {

      let data = {};
      const id = parseInt(req.params.id);
      if ('data' in req.body) {
        data = JSON.parse(req.body.data);
      } else {
        data = req.body;
      }

      const detail = await event.updateEvent(id, data);
      res.status(200).json({
        status: true,
        message: "Event updated successfully",
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
      let data = {}
      if ('data' in req.body) {
        data = JSON.parse(req.body.data);
      } else {
        data = req.body.status;
      }

      const response = await event.updateStatus(parseInt(id), data);
      res.status(200).json({
        status: true,
        message: "event status updated",
        response,
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };
}

module.exports = eventController;

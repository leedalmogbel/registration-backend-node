const notification = require("../services/notification.services");
const createError = require("http-errors");
const { ip } = require("../utils/helpers");

class notificationController {
  static store = async (req, res, next) => {
    try {
      let data = {}
      if ('data' in req.body) {
        data = JSON.parse(req.body.data);
      } else {
        data = req.body;
      }

      const response = await notification.create(data);

      res.status(200).json({
        status: true,
        message: "notification Created successfully",
        data: response,
      });
    } catch (err) {
      console.log("err", err);
      res.status(404).json({
        error: true,
        message: err.message,
      });
    }
  };

  static list = async (req, res, next) => {
    try {
      const params = req.query;
      const data = await notification.fetchAll(params);
      res.status(200).json({
        status: true,
        messsage: "Fetch all notifications",
        data,
      });
    } catch (err) {
        console.log(err)
        next(createError(err.statusCode, err.message));
    }
  };

  static show = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await notification.getnotificationDetail(parseInt(id));
      res.status(200).json({
        status: true,
        message: "Fetch notification",
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

      const detail = await notification.updatenotification(id, data);
      res.status(200).json({
        status: true,
        message: "notification updated successfully",
        data: detail,
      });
    } catch (err) {
      console.log("err", err);
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

      const data = await notification.updateStatus(parseInt(id), status);
      res.status(200).json({
        status: true,
        message: "notification status updated",
        data,
      });
    } catch (error) {
      console.log("error", error);
      next(createError(error.statusCode, error.message));
    }
  };
}

module.exports = notificationController;
